"""Command modules for the todos CLI."""

from cli.commands.init import run as init
from cli.commands.list import run as list_todos
from cli.commands.add import run as add
from cli.commands.done import run as done
from cli.commands.edit import run as edit
from cli.commands.suggest import run as suggest

__all__ = ["init", "list_todos", "add", "done", "edit", "suggest"]
