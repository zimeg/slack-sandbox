"""Initialize Todo's Guide - OAuth and list creation."""

import sys

from api import get_list_id, get_token, set_list_id, SlackLists
from cli.display import BOLD, DIM, GREEN, RED, RESET
from web.local import run_oauth_flow


def run() -> None:
    """Initialize Todo's Guide with OAuth and list creation."""
    print(f"{BOLD}Todo's Guide{RESET} — Setup\n")

    token_data = run_oauth_flow()
    if not token_data:
        print(f"\n{RED}✗{RESET} Authentication failed")
        sys.exit(1)

    print(f"\n{GREEN}✓{RESET} Connected to {token_data.get('team_name', 'Slack')}")

    try:
        list_id = get_list_id()
        print(f"{GREEN}✓{RESET} Todos list configured: {list_id}")
    except ValueError:
        print(f"\n{DIM}No todos list found.{RESET}")
        print("Creating todos list...")
        token = get_token()
        lists = SlackLists(token)
        result = lists.create_list()

        list_id = result.get("list_id")
        if not list_id:
            print(f"{RED}Error: Could not get list ID from response{RESET}")
            print(f"{DIM}{result}{RESET}")
            sys.exit(1)

        set_list_id(list_id)
        print(f"{GREEN}✓{RESET} List created: {list_id}")

    token = get_token()
    lists = SlackLists(token)
    auth = lists.client.auth_test()
    team_url = auth.get("url", "").rstrip("/")
    print(f"\n{GREEN}You're all set!{RESET} Try: todos add \"My first task\"")
    print(f"{DIM}{team_url}/lists/{list_id}{RESET}")
