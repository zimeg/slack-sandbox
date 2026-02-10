"""List todos with smart categorization."""

from api import SlackLists
from cli.display import (
    BOLD,
    DIM,
    RED,
    RESET,
    categorize_todos,
    display_item,
)


def run() -> None:
    """Display todos with smart categorization."""
    lists = SlackLists()

    items = lists.list_items()
    overdue, active = categorize_todos(items)

    if not items:
        print(f'{DIM}No todos yet. Add one with: todos add "your task"{RESET}')
        return

    if overdue:
        print(f"\n{BOLD}{RED}Overdue{RESET}")
        for item in overdue:
            display_item(item, f"{RED}!{RESET}")

    if active:
        print(f"\n{BOLD}Todo{RESET}")
        for item in active:
            display_item(item, "·")
