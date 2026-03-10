"""List ID credential management."""

import os
from pathlib import Path

from config._base import load, save as _save


def get() -> str:
    """Get list ID from environment or credentials file."""
    val = os.getenv("SLACK_TODOS_LIST_ID")
    if val:
        return val

    val = load().get("list")
    if val:
        return val

    raise ValueError(
        "No todos list configured. Run 'todos init' to create one, "
        "or set SLACK_TODOS_LIST_ID environment variable."
    )


def save(value: str) -> Path:
    """Save list ID to credentials file."""
    return _save({**load(), "list": value})
