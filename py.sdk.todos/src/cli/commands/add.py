"""Add a new todo."""

import sys

from api import SlackLists
from cli.display import GREEN, RED, RESET, format_due_date


def run(args: list[str]) -> None:
    """Add a new todo."""
    if not args:
        print(f"{RED}Error: No title provided{RESET}")
        print("Usage: todos add <title> [-d YYYY-MM-DD]")
        sys.exit(1)

    title_parts = []
    due_date = None

    i = 0
    while i < len(args):
        arg = args[i]
        if arg == "-d" and i + 1 < len(args):
            due_date = args[i + 1]
            i += 1
        else:
            title_parts.append(arg)
        i += 1

    title = " ".join(title_parts)
    if not title:
        print(f"{RED}Error: No title provided{RESET}")
        sys.exit(1)

    lists = SlackLists()

    lists.create_item(
        title=title,
        due_date=due_date,
    )

    print(f"{GREEN}Added:{RESET} {title}")
    if due_date:
        print(f"  {format_due_date(due_date)}")
