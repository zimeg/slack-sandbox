"""Shared credentials file handling."""

import json
import os
from pathlib import Path

CREDENTIALS_PATH = (
    Path.home() / ".config" / "slack" / "extensions" / "todos" / "credentials.json"
)


def load() -> dict:
    if CREDENTIALS_PATH.exists():
        with open(CREDENTIALS_PATH) as f:
            return json.load(f)
    return {}


def save(data: dict) -> Path:
    CREDENTIALS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(CREDENTIALS_PATH, "w") as f:
        json.dump(data, f, indent=2)
    os.chmod(CREDENTIALS_PATH, 0o600)
    return CREDENTIALS_PATH
