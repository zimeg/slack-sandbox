"""Initialize Todo's Guide - OAuth and list creation."""

import sys

from slack_sdk import WebClient

import config

from api import SlackLists
from cli.display import BOLD, DIM, GREEN, RED, RESET
from web.local import run_oauth_flow


def run() -> None:
    """Initialize Todo's Guide with OAuth and list creation."""
    print(f"\n  {BOLD}Welcome to Todo's Guide!{RESET} 🦤\n")

    if not run_oauth_flow():
        print(f"\n{RED}✗{RESET} Authentication failed")
        sys.exit(1)

    client = WebClient(token=config.token.get())
    auth = client.auth_test()
    team_name = auth.get("team", "Slack")
    team_url = auth.get("url", "").rstrip("/")

    print(f"\n{GREEN}✓{RESET} Connected to {team_name}")

    try:
        list_id = config.list.get()
    except ValueError:
        print(f"{DIM}  Creating todos list...{RESET}")
        result = SlackLists.create_list()

        list_id = result.get("list_id")
        if not list_id:
            print(f"{RED}✗{RESET} Could not create list")
            print(f"{DIM}{result}{RESET}")
            sys.exit(1)

        config.list.save(list_id)

    print(f"{GREEN}✓{RESET} Gathered list {team_url}/lists/{list_id}")
    print(f"{GREEN}✓{RESET} You're all set!")
    print('\nTry: todos add "My first task"')
