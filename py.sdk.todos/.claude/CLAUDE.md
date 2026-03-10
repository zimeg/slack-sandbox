# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Todo's Guide ("toh-doh") is a task management CLI using Slack Lists as the source of truth.

## Development Commands

```sh
# Enter dev shell (provides Python, slack-cli, ruff, mypy, sops)
nix develop

# Run CLI directly
nix run .#todos -- <command>

# Run web server
nix run .#server

# Lint
ruff check src/

# Validate flake
nix flake check
```

## Architecture

```
src/
├── api/          # Slack Lists API (SlackLists class)
├── config/       # Credentials management
│   ├── _base.py  # Shared load/save for credentials file
│   ├── token.py  # config.token.get() / .save()
│   └── list.py   # config.list.get() / .save()
├── cli/          # CLI application
│   ├── main.py   # Entry point & command routing
│   ├── display.py # Terminal formatting & colors
│   └── commands/ # One module per command with run() function
└── web/          # HTTP servers
    ├── server.py # Landing page + OAuth exchange (port 8080)
    └── local.py  # CLI OAuth callback handler (port 9876)
```

**Key patterns:**
- Config uses submodules: `config.token.get()`, `config.list.save(value)`
- Each command module exports a `run()` function
- Credentials stored at `~/.config/slack/extensions/todos/credentials.json`
- Slack Lists is the persistence layer - no local database
- OAuth requires CLI (`todos init`) - no browser-only flow

## Slack Lists API

Reference: [docs.slack.dev](https://docs.slack.dev/reference/methods/)

Required scopes: `lists:read`, `lists:write`

**Column IDs are dynamic** (e.g., `Col0ADJT23857`). Extract mapping from existing items:
```python
for field in item.get("fields", []):
    columns[field["key"]] = field["column_id"]
```

**Rich text format** for text columns:
```python
"rich_text": [{
    "type": "rich_text",
    "elements": [{
        "type": "rich_text_section",
        "elements": [{"type": "text", "text": title}]
    }]
}]
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `SLACK_USER_TOKEN` | User token (or use credentials file) |
| `SLACK_TODOS_LIST_ID` | List ID (or use credentials file) |

## Style

- Markdown links should always be inline: `[text](url)` not `[text][ref]`
- Function arguments and dict literals on separate lines
- HTML templates using `.format()` need escaped CSS braces: `body {{` not `body {`
