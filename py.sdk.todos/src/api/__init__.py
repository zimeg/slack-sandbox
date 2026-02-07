"""Shared API layer for Slack Lists and Ollama integration."""

from api.auth import (
    get_token,
    get_list_id,
    set_list_id,
    get_credentials,
    save_credentials,
    is_authenticated,
    CREDENTIALS_PATH,
)
from api.lists import SlackLists
from api.ollama import ollama_parse_intent, ollama_suggest

__all__ = [
    "get_token",
    "get_list_id",
    "set_list_id",
    "get_credentials",
    "save_credentials",
    "is_authenticated",
    "CREDENTIALS_PATH",
    "SlackLists",
    "ollama_parse_intent",
    "ollama_suggest",
]
