"""Mark a todo as complete."""

import sys

from api import SlackLists
from cli.display import GREEN, RED, RESET, get_name


def run(args: list[str]) -> None:
    """Mark a todo as complete."""
    if not args:
        print(f"{RED}Error: No record ID provided{RESET}")
        print("Usage: todos done <rec_id>")
        sys.exit(1)

    rec_id = args[0]
    lists = SlackLists()

    items = lists.list_items()
    item = next((i for i in items if i.get("id") == rec_id), None)

    if not item:
        print(f"{RED}Error: Todo {rec_id} not found{RESET}")
        sys.exit(1)

    lists.update_item(
        cells=[
            {
                "row_id": rec_id,
                "column_id": "Col00",
                "checkbox": True,
            },
        ],
    )
    print(f"{GREEN}Completed:{RESET} {get_name(item)}")
