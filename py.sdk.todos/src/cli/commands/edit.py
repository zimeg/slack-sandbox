"""Edit a todo using $EDITOR with natural language."""

import os
import subprocess
import sys
import tempfile

from api import get_token, get_list_id, SlackLists, ollama_parse_intent
from cli.display import DIM, GREEN, RED, YELLOW, RESET, is_completed


def run(args: list[str]) -> None:
    """Edit a todo using $EDITOR with natural language."""
    if not args:
        print(f"{RED}Error: No todo number provided{RESET}")
        print("Usage: todos edit <number>")
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
    incomplete = [i for i in items if not is_completed(i)]

    if num < 1 or num > len(incomplete):
        print(f"{RED}Error: Todo #{num} not found{RESET}")
        sys.exit(1)

    item = incomplete[num - 1]
    item_id = item.get("id")
    fields = {f.get("key"): f for f in item.get("fields", [])}
    name = fields.get("name", {}).get("text", "")

    editor = os.getenv("EDITOR") or os.getenv("VISUAL") or "vi"

    with tempfile.NamedTemporaryFile(mode="w", suffix=".md", delete=False) as f:
        f.write(f"# Editing: {name}\n\n")
        f.write("Current state:\n")
        f.write(f"  due: {fields.get('todo_due_date', {}).get('value', 'none')}\n\n")
        f.write("# Describe your changes below (natural language):\n")
        f.write("# Examples: 'due next friday', 'rename to ...'\n\n")
        tmp_path = f.name

    subprocess.call([editor, tmp_path])

    with open(tmp_path) as f:
        content = f.read()
    os.unlink(tmp_path)

    lines = content.split("\n")
    user_lines = []
    in_user_section = False
    for line in lines:
        if line.startswith("# Describe your changes"):
            in_user_section = True
            continue
        if in_user_section and not line.startswith("#"):
            user_lines.append(line)

    user_input = "\n".join(user_lines).strip()

    if not user_input:
        print(f"{YELLOW}No changes specified{RESET}")
        return

    print(f"{DIM}Processing with Ollama...{RESET}")
    updates = ollama_parse_intent(user_input, item)

    if not updates:
        print(f"{YELLOW}Could not parse changes. Try being more specific.{RESET}")
        return

    # TODO: convert ollama updates to cells format
    print(f"{DIM}{updates}{RESET}")
    print(f"{GREEN}Updated:{RESET} {name}")
