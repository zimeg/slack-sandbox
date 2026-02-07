"""CLI entry point and command routing."""

import sys

from cli import commands
from cli.display import BOLD, RED, RESET


def show_help() -> None:
    """Show help message."""
    print(f"{BOLD}todos{RESET} - Intelligent task management via Slack Lists\n")
    print("Commands:")
    print(f"  {BOLD}todos{RESET}              Show todos with smart categorization")
    print(f"  {BOLD}todos add{RESET} <title>  Add a new todo")
    print(f"                     Options: -p0/-p1/-p2/-p3, -d YYYY-MM-DD")
    print(f"  {BOLD}todos done{RESET} <num>   Mark todo as complete")
    print(f"  {BOLD}todos edit{RESET} <num>   Edit todo via $EDITOR (natural language)")
    print(f"  {BOLD}todos suggest{RESET}      Get AI suggestions (requires Ollama)")
    print(f"  {BOLD}todos init{RESET}         Create the todos list (first-time setup)")
    print(f"\nEnvironment:")
    print(f"  SLACK_USER_TOKEN    User token with lists:read, lists:write")
    print(f"  SLACK_TODOS_LIST_ID List ID (set by 'todos init')")
    print(f"  OLLAMA_MODEL        Model for AI features (default: llama3.2)")


def main() -> None:
    """Main entry point."""
    args = sys.argv[1:]

    if not args:
        commands.list_todos()
    elif args[0] == "init":
        commands.init()
    elif args[0] == "add":
        commands.add(args[1:])
    elif args[0] == "done":
        commands.done(args[1:])
    elif args[0] == "edit":
        commands.edit(args[1:])
    elif args[0] == "suggest":
        commands.suggest()
    elif args[0] in ("help", "--help", "-h"):
        show_help()
    else:
        print(f"{RED}Unknown command: {args[0]}{RESET}")
        show_help()
        sys.exit(1)
