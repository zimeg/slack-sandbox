"""Display helpers for terminal output."""

from datetime import date, datetime
from typing import Any

BOLD = "\x1b[1m"
DIM = "\x1b[2m"
RED = "\x1b[31m"
YELLOW = "\x1b[33m"
GREEN = "\x1b[32m"
BLUE = "\x1b[34m"
RESET = "\x1b[0m"


def get_field(item: dict[str, Any], key: str) -> Any:
    """Get a field value from an item's fields array by key."""
    for field in item.get("fields", []):
        if field.get("key") == key:
            return field
    return {}


def get_name(item: dict[str, Any]) -> str:
    """Get the name/title of an item."""
    return get_field(item, "name").get("text", "Untitled")


def get_due_date(item: dict[str, Any]) -> str | None:
    """Get the due date string from an item."""
    field = get_field(item, "todo_due_date")
    dates = field.get("date", [])
    return dates[0] if dates else None


def categorize_todos(
    items: list[dict[str, Any]],
) -> tuple[list, list]:
    """Categorize todos into overdue and active."""
    today = date.today()

    overdue = []
    active = []

    for item in items:
        if get_field(item, "todo_completed").get("checkbox", False):
            continue

        due_str = get_due_date(item)

        if due_str:
            try:
                due_date = datetime.strptime(due_str, "%Y-%m-%d").date()
                if due_date < today:
                    overdue.append(item)
                    continue
            except ValueError:
                pass

        active.append(item)

    return overdue, active


def format_due_date(due_str: str | None) -> str:
    """Format due date relative to today."""
    if not due_str:
        return ""
    try:
        due_date = datetime.strptime(due_str, "%Y-%m-%d").date()
        today = date.today()
        diff = (due_date - today).days

        if diff < 0:
            return (
                f"{RED}due: {abs(diff)} day{'s' if abs(diff) != 1 else ''} ago{RESET}"
            )
        elif diff == 0:
            return f"{YELLOW}due: today{RESET}"
        elif diff == 1:
            return f"{YELLOW}due: tomorrow{RESET}"
        else:
            return f"due: {due_str}"
    except ValueError:
        return f"due: {due_str}"


def display_item(item: dict[str, Any], prefix: str = "·") -> None:
    """Display a single todo item."""
    rec_id = item.get("id", "")
    name = get_name(item)
    due_str = get_due_date(item)

    parts = [f"{prefix} {DIM}{rec_id}{RESET} {name}"]

    if due_str:
        parts.append(format_due_date(due_str))

    print(" ".join(parts))
