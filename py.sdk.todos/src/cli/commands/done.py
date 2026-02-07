"""Mark a todo as complete."""

import sys

from api import get_token, get_list_id, SlackLists
from cli.display import DIM, GREEN, RED, RESET, get_name, is_completed


def run(args: list[str]) -> None:
    """Mark a todo as complete."""
    if not args:
        print(f"{RED}Error: No todo number provided{RESET}")
        print("Usage: todos done <number>")
        sys.exit(1)

    try:
        num = int(args[0])
    except ValueError:
        print(f"{RED}Error: Invalid todo number{RESET}")
        sys.exit(1)

    token = get_token()
    list_id = get_list_id()
    lists = SlackLists(token)

    items = lists.list_items(list_id)
    print(f"{DIM}{items}{RESET}")

    incomplete = [i for i in items if not is_completed(i)]

    if num < 1 or num > len(incomplete):
        print(f"{RED}Error: Todo #{num} not found{RESET}")
        sys.exit(1)

    item = incomplete[num - 1]
    item_id = item.get("id")

    result = lists.update_item(list_id, item_id, cells=[
        {"column_id": "Col00", "checkbox": True},
    ])
    print(f"{DIM}{result}{RESET}")
    print(f"{GREEN}Completed:{RESET} {get_name(item)}")
