"""List todos with smart categorization."""

from api import get_token, get_list_id, SlackLists
from cli.display import (
    BOLD,
    DIM,
    RED,
    YELLOW,
    RESET,
    categorize_todos,
    display_item,
    get_name,
)


def run() -> None:
    """Display todos with smart categorization."""
    token = get_token()
    list_id = get_list_id()
    lists = SlackLists(token)

    items = lists.list_items(list_id)
    print(f"{DIM}{items}{RESET}")
    overdue, stale, active, completed = categorize_todos(items)

    if not items:
        print(f"{DIM}No todos yet. Add one with: todos add \"your task\"{RESET}")
        return

    num = 1

    if overdue:
        print(f"\n{BOLD}{RED}=== OVERDUE ==={RESET}")
        for item in overdue:
            display_item(num, item, f"{RED}[!]{RESET}")
            num += 1

    if stale:
        print(f"\n{BOLD}{YELLOW}=== STALE (7+ days) ==={RESET}")
        for item in stale:
            display_item(num, item, f"{YELLOW}[?]{RESET}")
            num += 1

    if active:
        print(f"\n{BOLD}=== TODO ==={RESET}")
        for item in active:
            display_item(num, item)
            num += 1

    if completed:
        print(f"\n{DIM}=== COMPLETED ==={RESET}")
        for item in completed:
            print(f"{DIM}[x] {get_name(item)}{RESET}")
