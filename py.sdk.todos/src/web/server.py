"""Online server for documentation and OAuth handling.

This server provides:
- Landing page with documentation
- OAuth initiation (redirects to Slack)
- OAuth callback handler (exchanges code for token)
"""

import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

import requests

# Server configuration
PORT = int(os.getenv("PORT", "8080"))
HOST = os.getenv("HOST", "0.0.0.0")

# OAuth configuration
CLIENT_ID = os.getenv("SLACK_CLIENT_ID", "")
CLIENT_SECRET = os.getenv("SLACK_CLIENT_SECRET", "")
REDIRECT_URI = os.getenv("OAUTH_REDIRECT_URI", "http://localhost:9876/callback")

# Landing page HTML
LANDING_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Todo's Guide</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1d1c1d;
            background: #f8f8f8;
        }
        .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
        header {
            background: #4A154B;
            color: white;
            padding: 60px 20px;
            text-align: center;
        }
        header h1 { font-size: 3rem; margin-bottom: 10px; }
        header p { font-size: 1.2rem; opacity: 0.9; }
        .pronunciation {
            font-style: italic;
            opacity: 0.8;
            margin-top: 5px;
        }
        section { background: white; padding: 30px; margin: 20px 0; border-radius: 8px; }
        h2 { color: #4A154B; margin-bottom: 15px; }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'SF Mono', Monaco, monospace;
        }
        pre {
            background: #1d1c1d;
            color: #e8e8e8;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
        }
        pre code { background: none; padding: 0; }
        .btn {
            display: inline-block;
            background: #4A154B;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            margin-top: 10px;
        }
        .btn:hover { background: #611f69; }
        ul { padding-left: 20px; }
        li { margin: 8px 0; }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .feature { text-align: center; padding: 20px; }
        .feature-icon { font-size: 2rem; margin-bottom: 10px; }
        footer { text-align: center; padding: 40px; color: #666; }
    </style>
</head>
<body>
    <header>
        <h1>Todo's Guide</h1>
        <p>A collaborative task management companion for Slack</p>
        <p class="pronunciation">"toh-doh" — like the bird, but with better priorities</p>
    </header>

    <div class="container">
        <section>
            <h2>What is Todo's Guide?</h2>
            <p>Todo's Guide (TG) is your friendly neighborhood task wrangler. It uses Slack Lists
            as the source of truth, with AI-powered intelligence to keep you organized.</p>

            <div class="features">
                <div class="feature">
                    <div class="feature-icon">📋</div>
                    <strong>Smart Lists</strong>
                    <p>Overdue and stale task detection</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🤖</div>
                    <strong>AI Suggestions</strong>
                    <p>Powered by local Ollama</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">✏️</div>
                    <strong>Natural Language</strong>
                    <p>Edit tasks with plain English</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🔒</div>
                    <strong>Your Data</strong>
                    <p>Slack is the source of truth</p>
                </div>
            </div>
        </section>

        <section>
            <h2>Quick Start</h2>
            <pre><code># Install and authenticate
todos init

# View your todos
todos

# Add a task
todos add "Ship the feature" -p1

# Mark complete
todos done 1</code></pre>
        </section>

        <section>
            <h2>Commands</h2>
            <ul>
                <li><code>todos</code> — Smart list with overdue/stale highlights</li>
                <li><code>todos add &lt;title&gt;</code> — Add a todo (-p0 to -p3, -d YYYY-MM-DD)</li>
                <li><code>todos done &lt;id&gt;</code> — Mark complete</li>
                <li><code>todos edit &lt;id&gt;</code> — Edit via $EDITOR with natural language</li>
                <li><code>todos suggest</code> — Get AI suggestions (requires Ollama)</li>
                <li><code>todos init</code> — Authenticate with Slack</li>
            </ul>
        </section>

        <section>
            <h2>Connect to Slack</h2>
            <p>Authenticate with your Slack workspace to get started:</p>
            <a href="/login" class="btn">Add to Slack</a>
        </section>
    </div>

    <footer>
        <p>Todo's Guide — Now go forth and conquer that backlog!</p>
    </footer>
</body>
</html>"""

SUCCESS_PAGE = """<!DOCTYPE html>
<html>
<head>
    <title>Todo's Guide - Connected!</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px;
            margin: 100px auto;
            padding: 20px;
            text-align: center;
        }
        h1 { color: #4A154B; }
        .token { background: #f4f4f4; padding: 10px; border-radius: 4px; word-break: break-all; }
    </style>
</head>
<body>
    <h1>Connected!</h1>
    <p>Todo's Guide is now connected to <strong>{team_name}</strong>.</p>
    <p>If you're using the CLI, you can close this window.</p>
    <p>Otherwise, set this environment variable:</p>
    <pre class="token">export SLACK_USER_TOKEN={token}</pre>
</body>
</html>"""


class Handler(BaseHTTPRequestHandler):
    """HTTP request handler."""

    def log_message(self, format: str, *args) -> None:
        """Log requests."""
        print(f"{self.address_string()} - {format % args}")

    def do_GET(self) -> None:
        """Handle GET requests."""
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/":
            self._send_html(LANDING_PAGE)
        elif path == "/login":
            self._handle_oauth_start(parsed.query)
        elif path == "/oauth/callback":
            self._handle_oauth_callback(parsed.query)
        elif path == "/health":
            self._send_json({"status": "ok"})
        else:
            self.send_error(404)

    def _handle_oauth_start(self, query: str) -> None:
        """Redirect to Slack OAuth."""
        if not CLIENT_ID:
            self._send_html("<h1>Error</h1><p>SLACK_CLIENT_ID not configured</p>", 500)
            return

        params = parse_qs(query)
        redirect_uri = params.get("redirect_uri", [REDIRECT_URI])[0]
        state = params.get("state", [""])[0]

        auth_url = (
            "https://slack.com/oauth/v2/authorize"
            f"?client_id={CLIENT_ID}"
            f"&scope="
            f"&user_scope=lists:read,lists:write"
            f"&redirect_uri={redirect_uri}"
        )
        if state:
            auth_url += f"&state={state}"
        self.send_response(302)
        self.send_header("Location", auth_url)
        self.end_headers()

    def _handle_oauth_callback(self, query: str) -> None:
        """Handle OAuth callback."""
        params = parse_qs(query)

        if "error" in params:
            error = params["error"][0]
            self._send_html(f"<h1>Error</h1><p>{error}</p>", 400)
            return

        if "code" not in params:
            self._send_html("<h1>Error</h1><p>No authorization code</p>", 400)
            return

        code = params["code"][0]

        # Exchange code for token
        try:
            response = requests.post(
                "https://slack.com/api/oauth.v2.access",
                data={
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": REDIRECT_URI,
                },
                timeout=30,
            )
            data = response.json()

            if data.get("ok"):
                token = data.get("authed_user", {}).get("access_token", "")
                team_name = data.get("team", {}).get("name", "your workspace")
                self._send_html(SUCCESS_PAGE.format(token=token, team_name=team_name))
            else:
                self._send_html(f"<h1>Error</h1><p>{data.get('error')}</p>", 400)
        except Exception as e:
            self._send_html(f"<h1>Error</h1><p>{e}</p>", 500)

    def _send_html(self, html: str, status: int = 200) -> None:
        """Send HTML response."""
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(html.encode())))
        self.end_headers()
        self.wfile.write(html.encode())

    def _send_json(self, data: dict, status: int = 200) -> None:
        """Send JSON response."""
        body = json.dumps(data)
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body.encode())


def main() -> None:
    """Run the server."""
    server = HTTPServer((HOST, PORT), Handler)
    print(f"Todo's Guide server running on http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.server_close()


if __name__ == "__main__":
    main()
