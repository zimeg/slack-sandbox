# Todo's Guide

> _toh-doh_ — like the bird, but with better priorities.

A collaborative task management companion powered by [Slack Lists](https://slack.com/help/articles/27452748828179-Use-lists-in-Slack) and [Ollama](https://ollama.com/) intelligence.

## Getting started

```sh
# First-time setup: create your todos list
todos init

# View your todos with smart categorization
todos

# Add a task
todos add "Fix authentication bug" -p1

# Mark complete
todos done 1
```

## Commands

| Command             | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| `todos`             | Smart list with overdue/stale highlights                          |
| `todos add <title>` | Add a todo (`-p0` to `-p3` for priority, `-d YYYY-MM-DD` for due) |
| `todos done <id>`   | Mark complete                                                     |
| `todos edit <id>`   | Edit via `$EDITOR` with natural language                          |
| `todos suggest`     | Get AI suggestions (requires Ollama)                              |
| `todos init`        | Create the todos list (first-time setup)                          |

## Smart display

```
=== OVERDUE ===
[!] #2: Fix authentication bug (due: 2 days ago) [P1]

=== STALE (7+ days) ===
[?] #5: Update documentation [P2]

=== TODO ===
[ ] #3: Add unit tests [P2]
```

## Environment variables

| Variable              | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `SLACK_USER_TOKEN`    | User token with `lists:read` and `lists:write` scopes |
| `SLACK_TODOS_LIST_ID` | List ID (set by `todos init`)                         |
| `OLLAMA_MODEL`        | Model for AI features (default: `llama3.2`)           |
| `OLLAMA_URL`          | Ollama API URL (default: `http://localhost:11434`)    |

## Setup

1. [Create a new app](https://api.slack.com/apps) using the `manifest.json`
2. Install the app and get a user token with `lists:read` and `lists:write` scopes
3. Export your token: `export SLACK_USER_TOKEN=xoxp-...`
4. Run `todos init` to create your list and get the list ID
5. Export the list ID: `export SLACK_TODOS_LIST_ID=L...`
