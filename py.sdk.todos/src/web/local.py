"""Local OAuth server for todos init.

Starts a temporary server to handle OAuth redirects and save credentials.
"""

import os
import secrets
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer
from importlib import resources
from urllib.parse import parse_qs, urlparse

import requests

import config
from cli.display import DIM, RESET

# OAuth configuration
LOCAL_PORT = 9876
SERVER_URL = os.getenv("OAUTH_SERVER_URL", "https://todos.guide")
SERVER_REDIRECT_URI = f"{SERVER_URL}/callback"

# Templates
CALLBACK_PAGE = resources.files("web.templates").joinpath("callback.html").read_text()


class OAuthHandler(BaseHTTPRequestHandler):
    """HTTP handler for OAuth callback."""

    server_instance: "OAuthServer"

    def log_message(self, format: str, *args) -> None:
        """Suppress default logging."""
        pass

    def do_GET(self) -> None:
        """Handle GET requests."""
        parsed = urlparse(self.path)

        if parsed.path == "/finish":
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

        # Strip port suffix if present (from server-proxied flow)
        if state and ":" in state:
            state = state.rsplit(":", 1)[0]

        # Verify state to prevent CSRF
        if state != self.server_instance.oauth_state:
            self._send_html(
                "<h1>Invalid State</h1><p>State mismatch. Please try again.</p>",
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
        """Exchange authorization code via server."""
        try:
            response = requests.post(
                f"{SERVER_URL}/oauth/exchange",
                json={"code": code, "redirect_uri": SERVER_REDIRECT_URI},
                timeout=30,
            )
            data = response.json()

            if data.get("ok"):
                return {"token": data.get("access_token")}
            else:
                return None
        except Exception:
            return None

    def _send_html(self, body: str, status: int = 200) -> None:
        """Send HTML response."""
        html = CALLBACK_PAGE.format(body=body)
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


def run_oauth_flow() -> dict | None:
    """Run the complete OAuth flow.

    Returns token data on success, None on failure.
    """
    server = OAuthServer()
    auth_url = f"{SERVER_URL}/login?state={server.oauth_state}&local_port={LOCAL_PORT}"

    print(f"{DIM}Opening browser for Slack authorization...")
    print(f"If browser doesn't open, visit: {auth_url}")
    webbrowser.open(auth_url)

    print(f"Waiting for authorization on http://localhost:{LOCAL_PORT}...{RESET}")

    # Serve until callback received
    while not server.should_stop:
        server.handle_request()

    server.server_close()

    if server.oauth_error:
        print("Authorization failed. Please try again.")
        return None

    if server.token_data:
        path = config.token.save(server.token_data["token"])
        print(f"{DIM}Credentials saved to {path}{RESET}")
        return server.token_data

    return None
