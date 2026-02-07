# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Todo's Guide ("toh-doh") is a task management CLI using Slack Lists as the source of truth, with optional Ollama AI for suggestions and natural language editing.

## Development Commands

```sh
# Enter dev shell (provides Python, slack-cli, ollama, ruff, mypy)
nix develop

# Run CLI directly
nix run .#todos -- <command>

# Run web server
nix run .#server

# Type check
python3 -m py_compile src/cli/main.py src/api/auth.py src/api/lists.py

# Lint
ruff check src/

# Validate flake
nix flake check
```

## Architecture

```
src/
├── api/          # Shared layer (auth, Slack Lists API, Ollama)
├── cli/          # CLI application
│   ├── main.py   # Entry point & command routing
│   ├── display.py # Terminal formatting & colors
│   └── commands/ # One module per command with run() function
└── web/          # HTTP servers
    ├── server.py # Landing page + OAuth (port 8080)
    └── local.py  # CLI OAuth handler (port 9876)
```

**Key patterns:**
- `src/api/` is shared between CLI and web - no circular imports
- Each command module exports a `run()` function
- Credentials stored at `~/.config/slack/todos/credentials.json`
- Slack Lists is the persistence layer - no local database

## Slack Integration

Uses Slack Lists API (not channels/messages). Required scopes: `lists:read`, `lists:write`.

Custom list columns: Priority (P0-P3), Status (not_started/in_progress/blocked), Created, Details, Notes.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `SLACK_USER_TOKEN` | User token (or use credentials file) |
| `SLACK_TODOS_LIST_ID` | List ID (or use credentials file) |
| `OLLAMA_MODEL` | AI model (default: llama3.2) |
| `OLLAMA_URL` | Ollama API (default: http://localhost:11434) |

## Style

- Markdown links should always be inline: `[text](url)` not `[text][ref]`
