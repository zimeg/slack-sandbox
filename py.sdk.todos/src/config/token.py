"""Token credential management."""

import os
from pathlib import Path

from config._base import load, save as _save


def get() -> str:
    """Get user token from environment or credentials file."""
    val = os.getenv("SLACK_USER_TOKEN")
    if val:
        return val

    val = load().get("token")
    if val:
        return val

    raise ValueError(
        "Not authenticated. Run 'todos init' to connect to Slack, "
        "or set SLACK_USER_TOKEN environment variable."
    )


def save(value: str) -> Path:
    """Save token to credentials file."""
    return _save({**load(), "token": value})
