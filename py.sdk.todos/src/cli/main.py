"""CLI entry point and command routing."""

import sys

from cli import commands
from cli.display import BOLD, RED, RESET


def show_help() -> None:
    """Show help message."""
    print(f"{BOLD}todos{RESET} - Task management via Slack Lists\n")
    print("Commands:")
    print(f"  {BOLD}todos{RESET}              Show todos")
    print(f"  {BOLD}todos add{RESET} <title>  Add a new todo (-d YYYY-MM-DD)")
    print(f"  {BOLD}todos done{RESET} <id>    Mark todo as complete")
    print(f"  {BOLD}todos init{RESET}         Authenticate and create todos list")
    print("\nEnvironment:")
    print("  SLACK_USER_TOKEN    User token with lists:read, lists:write")
    print("  SLACK_TODOS_LIST_ID List ID (set by 'todos init')")


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
    elif args[0] in ("help", "--help", "-h"):
        show_help()
    else:
        print(f"{RED}Unknown command: {args[0]}{RESET}")
        show_help()
        sys.exit(1)
