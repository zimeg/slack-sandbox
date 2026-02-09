"""Online server for documentation and OAuth handling.

This server provides:
- Landing page with documentation
- OAuth initiation (redirects to Slack)
- OAuth callback handler (exchanges code for token)
"""

import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from importlib import resources
from urllib.parse import parse_qs, urlparse

from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

# Server configuration
PORT = int(os.getenv("PORT", "8080"))
HOST = os.getenv("HOST", "0.0.0.0")

# OAuth configuration
CLIENT_ID = os.getenv("SLACK_CLIENT_ID", "")
CLIENT_SECRET = os.getenv("SLACK_CLIENT_SECRET", "")
REDIRECT_URI = os.getenv("OAUTH_REDIRECT_URI", "http://localhost:9876/callback")

# Templates
LANDING_PAGE = resources.files("web.templates").joinpath("landing.html").read_text()


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
        else:
            self.send_error(404)

    def do_POST(self) -> None:
        """Handle POST requests."""
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/oauth/exchange":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            self._handle_oauth_exchange(body)
        else:
            self.send_error(404)

    def _handle_oauth_start(self, query: str) -> None:
        """Redirect to Slack OAuth (requires state from CLI)."""
        params = parse_qs(query)
        state = params.get("state", [""])[0]
        redirect_uri = params.get("redirect_uri", [REDIRECT_URI])[0]

        # Sanitize values used in HTTP headers to prevent response splitting
        state = state.replace("\r", "").replace("\n", "")
        redirect_uri = redirect_uri.replace("\r", "").replace("\n", "")

        if not state:
            self._send_html(
                "<h1>CLI Required</h1>"
                "<p>Please run <code>todos init</code> from your terminal.</p>",
                400,
            )
            return

        if not CLIENT_ID:
            self._send_html("<h1>Error</h1><p>Server not configured</p>", 500)
            return

        auth_url = (
            "https://slack.com/oauth/v2/authorize"
            f"?client_id={CLIENT_ID}"
            f"&scope="
            f"&user_scope=lists:read,lists:write"
            f"&redirect_uri={redirect_uri}"
            f"&state={state}"
        )
        self.send_response(302)
        self.send_header("Location", auth_url)
        self.end_headers()

    def _handle_oauth_exchange(self, body: bytes) -> None:
        """Exchange authorization code for token (called by CLI)."""
        try:
            data = json.loads(body)
            code = data.get("code")
            redirect_uri = data.get("redirect_uri")

            if not code or not redirect_uri:
                self._send_json({"ok": False, "error": "missing_parameters"}, 400)
                return

            client = WebClient()
            response = client.oauth_v2_access(
                client_id=CLIENT_ID,
                client_secret=CLIENT_SECRET,
                code=code,
                redirect_uri=redirect_uri,
            )

            token_data = {
                "ok": True,
                "access_token": response["authed_user"]["access_token"],
                "scope": response["authed_user"]["scope"],
                "team_id": response["team"]["id"],
                "team_name": response["team"]["name"],
                "user_id": response["authed_user"]["id"],
            }
            self._send_json(token_data)
        except SlackApiError as e:
            self._send_json({"ok": False, "error": e.response["error"]}, 400)
        except Exception as e:
            self._send_json({"ok": False, "error": str(e)}, 500)

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
