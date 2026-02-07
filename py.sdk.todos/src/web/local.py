"""Local OAuth server for todos init.

Starts a temporary server to handle OAuth redirects and save credentials.
"""

import json
import os
import secrets
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import requests

# OAuth configuration
LOCAL_PORT = 9876
REDIRECT_URI = f"http://localhost:{LOCAL_PORT}/callback"
CREDENTIALS_PATH = Path.home() / ".config" / "slack" / "todos" / "credentials.json"

# OAuth configuration
CLIENT_ID = os.getenv("SLACK_CLIENT_ID", "")
CLIENT_SECRET = os.getenv("SLACK_CLIENT_SECRET", "")
LOGIN_URL = os.getenv("OAUTH_LOGIN_URL", "https://todos.guide/login")


class OAuthHandler(BaseHTTPRequestHandler):
    """HTTP handler for OAuth callback."""

    server_instance: "OAuthServer"

    def log_message(self, format: str, *args) -> None:
        """Suppress default logging."""
        pass

    def do_GET(self) -> None:
        """Handle GET requests."""
        parsed = urlparse(self.path)

        if parsed.path == "/callback":
            self._handle_callback(parsed.query)
        elif parsed.path == "/":
            self._send_html(
                "<h1>Todo's Guide</h1>"
                "<p>Waiting for authorization...</p>"
                "<p>Please complete the OAuth flow in your browser.</p>"
            )
        else:
            self.send_error(404)

    def _handle_callback(self, query: str) -> None:
        """Handle OAuth callback with authorization code."""
        params = parse_qs(query)

        if "error" in params:
            error = params["error"][0]
            self._send_html(
                f"<h1>Authorization Failed</h1>"
                f"<p>Error: {error}</p>"
                "<p>You can close this window.</p>",
                status=400,
            )
            self.server_instance.oauth_error = error
            self.server_instance.should_stop = True
            return

        if "code" not in params:
            self._send_html(
                "<h1>Missing Authorization Code</h1>"
                "<p>No code received from Slack.</p>",
                status=400,
            )
            return

        code = params["code"][0]
        state = params.get("state", [None])[0]

        # Verify state to prevent CSRF
        if state != self.server_instance.oauth_state:
            self._send_html(
                "<h1>Invalid State</h1>"
                "<p>State mismatch. Please try again.</p>",
                status=400,
            )
            return

        # Exchange code for token
        token_data = self._exchange_code(code)

        if token_data:
            self._send_html(
                "<h1>Authorization Complete!</h1>"
                "<p>Todo's Guide is now connected to your Slack workspace.</p>"
                "<p>You can close this window and return to your terminal.</p>"
                "<script>window.close()</script>"
            )
            self.server_instance.token_data = token_data
        else:
            self._send_html(
                "<h1>Token Exchange Failed</h1>"
                "<p>Could not exchange authorization code for token.</p>",
                status=500,
            )
            self.server_instance.oauth_error = "token_exchange_failed"

        self.server_instance.should_stop = True

    def _exchange_code(self, code: str) -> dict | None:
        """Exchange authorization code for access token."""
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
                return {
                    "access_token": data.get("authed_user", {}).get("access_token"),
                    "token_type": data.get("authed_user", {}).get("token_type"),
                    "scope": data.get("authed_user", {}).get("scope"),
                    "team_id": data.get("team", {}).get("id"),
                    "team_name": data.get("team", {}).get("name"),
                    "user_id": data.get("authed_user", {}).get("id"),
                }
            else:
                print(f"OAuth error: {data.get('error')}")
                return None
        except Exception as e:
            print(f"Token exchange error: {e}")
            return None

    def _send_html(self, body: str, status: int = 200) -> None:
        """Send HTML response."""
        html = f"""<!DOCTYPE html>
<html>
<head>
    <title>Todo's Guide</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px;
            margin: 100px auto;
            padding: 20px;
            text-align: center;
            color: #1d1c1d;
        }}
        h1 {{ color: #4A154B; }}
    </style>
</head>
<body>{body}</body>
</html>"""
        self.send_response(status)
        self.send_header("Content-Type", "text/html")
        self.send_header("Content-Length", str(len(html)))
        self.end_headers()
        self.wfile.write(html.encode())


class OAuthServer(HTTPServer):
    """OAuth server that can be stopped after receiving callback."""

    def __init__(self, port: int = LOCAL_PORT):
        super().__init__(("localhost", port), OAuthHandler)
        self.oauth_state = secrets.token_urlsafe(32)
        self.token_data: dict | None = None
        self.oauth_error: str | None = None
        self.should_stop = False
        # Link handler to server instance
        OAuthHandler.server_instance = self


def get_authorization_url(state: str) -> str:
    """Build authorization URL via the online server's login page."""
    return (
        f"{LOGIN_URL}"
        f"?redirect_uri={REDIRECT_URI}"
        f"&state={state}"
    )


def save_credentials(token_data: dict) -> Path:
    """Save credentials to config file."""
    CREDENTIALS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(CREDENTIALS_PATH, "w") as f:
        json.dump(token_data, f, indent=2)
    # Secure the file
    os.chmod(CREDENTIALS_PATH, 0o600)
    return CREDENTIALS_PATH


def run_oauth_flow() -> dict | None:
    """Run the complete OAuth flow.

    Returns token data on success, None on failure.
    """
    server = OAuthServer()
    auth_url = get_authorization_url(server.oauth_state)

    print(f"Opening browser for Slack authorization...")
    print(f"If browser doesn't open, visit: {auth_url}")
    webbrowser.open(auth_url)

    print(f"Waiting for authorization on http://localhost:{LOCAL_PORT}...")

    # Serve until callback received
    while not server.should_stop:
        server.handle_request()

    server.server_close()

    if server.oauth_error:
        print(f"Authorization failed: {server.oauth_error}")
        return None

    if server.token_data:
        path = save_credentials(server.token_data)
        print(f"Credentials saved to {path}")
        return server.token_data

    return None
