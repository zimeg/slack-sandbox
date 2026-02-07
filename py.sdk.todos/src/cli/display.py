"""Display helpers for terminal output."""

from datetime import date, datetime, timedelta
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


def is_completed(item: dict[str, Any]) -> bool:
    """Check if an item is completed."""
    field = get_field(item, "todo_completed")
    return bool(field.get("checkbox", field.get("value", False)))


def get_due_date(item: dict[str, Any]) -> str | None:
    """Get the due date string from an item."""
    field = get_field(item, "todo_due_date")
    dates = field.get("date", [])
    return dates[0] if dates else None


def categorize_todos(
    items: list[dict[str, Any]],
) -> tuple[list, list, list, list]:
    """Categorize todos into overdue, stale, active, and completed."""
    today = date.today()
    stale_threshold = today - timedelta(days=7)

    overdue = []
    stale = []
    active = []
    completed = []

    for item in items:
        if is_completed(item):
            completed.append(item)
            continue

        due_str = get_due_date(item)
        created_ts = item.get("date_created")

        if due_str:
            try:
                due_date = datetime.strptime(due_str, "%Y-%m-%d").date()
                if due_date < today:
                    overdue.append(item)
                    continue
            except ValueError:
                pass

        if created_ts:
            try:
                created_date = datetime.fromtimestamp(created_ts).date()
                if created_date < stale_threshold:
                    stale.append(item)
                    continue
            except (ValueError, OSError):
                pass

        active.append(item)

    return overdue, stale, active, completed


def format_due_date(due_str: str | None) -> str:
    """Format due date relative to today."""
    if not due_str:
        return ""
    try:
        due_date = datetime.strptime(due_str, "%Y-%m-%d").date()
        today = date.today()
        diff = (due_date - today).days

        if diff < 0:
            return f"{RED}due: {abs(diff)} day{'s' if abs(diff) != 1 else ''} ago{RESET}"
        elif diff == 0:
            return f"{YELLOW}due: today{RESET}"
        elif diff == 1:
            return f"{YELLOW}due: tomorrow{RESET}"
        else:
            return f"due: {due_str}"
    except ValueError:
        return f"due: {due_str}"


def display_item(num: int, item: dict[str, Any], prefix: str = "[ ]") -> None:
    """Display a single todo item."""
    name = get_name(item)
    due_str = get_due_date(item)

    parts = [f"{prefix} #{num}: {name}"]

    if due_str:
        parts.append(format_due_date(due_str))

    print(" ".join(parts))
