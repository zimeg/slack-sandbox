"""Get AI suggestions for todos."""

from api import get_token, get_list_id, SlackLists, ollama_suggest
from cli.display import BOLD, DIM, GREEN, YELLOW, RESET


def run() -> None:
    """Get AI suggestions for todos."""
    token = get_token()
    list_id = get_list_id()
    lists = SlackLists(token)

    items = lists.list_items(list_id)
    incomplete = [i for i in items if not i.get("completed")]

    if not incomplete:
        print(f"{DIM}No active todos to analyze{RESET}")
        return

    print(f"{DIM}Analyzing with Ollama...{RESET}")
    suggestions = ollama_suggest(incomplete)

    if not suggestions:
        print(f"{GREEN}All todos look good!{RESET}")
        return

    print(f"\n{BOLD}=== SUGGESTIONS ==={RESET}\n")
    for s in suggestions:
        num = s.get("id", 0)
        suggestion = s.get("suggestion", "")
        if 1 <= num <= len(incomplete):
            item = incomplete[num - 1]
            title = item.get("title", "Untitled")
            print(f"#{num} {title}")
            print(f"  {YELLOW}-> {suggestion}{RESET}\n")

            item_id = item.get("id")
            lists.update_item(list_id, item_id, notes=suggestion)

    print(f"{DIM}Suggestions saved to notes field{RESET}")
