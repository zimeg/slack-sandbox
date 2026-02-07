"""Token management - reads from ~/.config/slack/todos or environment."""

import json
import os
from pathlib import Path

CREDENTIALS_PATH = Path.home() / ".config" / "slack" / "todos" / "credentials.json"


def get_credentials() -> dict:
    """Load credentials from config file."""
    if CREDENTIALS_PATH.exists():
        with open(CREDENTIALS_PATH) as f:
            return json.load(f)
    return {}


def save_credentials(data: dict) -> Path:
    """Save credentials to config file."""
    CREDENTIALS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(CREDENTIALS_PATH, "w") as f:
        json.dump(data, f, indent=2)
    os.chmod(CREDENTIALS_PATH, 0o600)
    return CREDENTIALS_PATH


def get_token() -> str:
    """Get user token from credentials file or environment.

    Priority:
    1. SLACK_USER_TOKEN environment variable
    2. ~/.config/slack/todos/credentials.json
    """
    # Environment variable takes precedence
    token = os.getenv("SLACK_USER_TOKEN")
    if token:
        return token

    # Try credentials file
    creds = get_credentials()
    token = creds.get("access_token")
    if token:
        return token

    raise ValueError(
        "Not authenticated. Run 'todos init' to connect to Slack, "
        "or set SLACK_USER_TOKEN environment variable."
    )


def get_list_id() -> str:
    """Get the todos list ID from credentials file or environment.

    Priority:
    1. SLACK_TODOS_LIST_ID environment variable
    2. ~/.config/slack/todos/credentials.json
    """
    # Environment variable takes precedence
    list_id = os.getenv("SLACK_TODOS_LIST_ID")
    if list_id:
        return list_id

    # Try credentials file
    creds = get_credentials()
    list_id = creds.get("list_id")
    if list_id:
        return list_id

    raise ValueError(
        "No todos list configured. Run 'todos init' to create one, "
        "or set SLACK_TODOS_LIST_ID environment variable."
    )


def set_list_id(list_id: str) -> None:
    """Save list ID to credentials file."""
    creds = get_credentials()
    creds["list_id"] = list_id
    save_credentials(creds)


def is_authenticated() -> bool:
    """Check if user has valid credentials."""
    try:
        get_token()
        return True
    except ValueError:
        return False
