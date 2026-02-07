# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

A polyglot monorepo for experimenting with Slack APIs. Contains independent projects using different Slack SDKs and frameworks. Each subdirectory is a standalone app that can be deployed independently.

## Project Structure

| Directory | Stack | Purpose |
|-----------|-------|---------|
| `deno.sdk.begut` | Deno Slack SDK | Budget/expense tracking |
| `deno.sdk.chanl` | Deno Slack SDK | Ephemeral channel creation |
| `java.sdk.gibra` | Java Slack SDK + Gradle + JDK 21 | API method testing |
| `js.bolt.surge` | Bolt JS + Node 22 + PostgreSQL + Heroku | Email organizer |
| `js.bolt.tails` | Bolt JS + TypeScript + yt-dlp | Video archival |
| `py.bolt.snaek` | Bolt Python + Ollama | LLM chat bot |
| `py.sdk.sdkai` | Python Slack SDK | SDK snippet testing |

## Git

- Never push directly to main
- Always create PRs from feature branches

## Pull Requests

- Always add relevant labels (use `gh label list` to see available)
- Use a single emoji in the PR body (e.g., `:hamsa:`, `:space_invader:`)
- Use lowercase for PR titles
- When merging with `gh pr merge`, use `--auto` to wait for CI - never `--admin`
- Never force push - if a branch needs to be reset, use `@dependabot recreate` comment instead
- For CLAUDE.md updates: prefix with `chore(claude):` and merge with `--auto`

## Dependabot

When Dependabot PRs need lockfile updates or other fixes:
1. Comment `@dependabot recreate` to have Dependabot recreate the PR fresh
2. Fetch and checkout the new branch
3. Make necessary changes (e.g., `npm install` to sync lockfile)
4. Commit and push (no force push needed on a fresh branch)

## Architecture Patterns

**Bolt Apps** (js.bolt.surge, js.bolt.tails, py.bolt.snaek): Use Socket Mode with listener/handler registration pattern. Entry point is `app.js` or `app.py`.

**Deno Apps** (deno.sdk.begut, deno.sdk.chanl): Manifest-driven with `manifest.ts`. Functions in `functions/`, workflows in `workflows/`, triggers in `triggers/`.

**SDK Direct** (java.sdk.gibra, py.sdk.sdkai): Direct API calls without Bolt framework.

## Development Commands

All apps use Nix flakes for reproducible dev environments. Enter a shell with `nix develop` in any project directory.

### Common Slack CLI Commands
```sh
slack run      # Start local development server (Socket Mode)
slack deploy   # Deploy to production
```

### JavaScript (js.bolt.surge, js.bolt.tails)
```sh
npm install           # Install dependencies
npm start             # Run the app
npm test              # Lint + type check + run tests
npm run lint          # Check with Biome
npm run lint:fix      # Fix linting issues
npm run watch         # Dev mode with nodemon
npm run logs          # Tail Heroku logs (surge only)
```

### Python (py.bolt.snaek)
```sh
make test             # Format check + lint + type check
make lint             # Format and lint with ruff
make schema           # Validate manifest against schema
make clean            # Remove cache files
python3 app.py        # Run the app
```

### Java (java.sdk.gibra)
```sh
./gradlew build       # Build the project
./gradlew run         # Run the app
./gradlew run -Pargs="--help"  # Run with arguments
./gradlew shadowJar   # Build fat JAR
```

### Deno (deno.sdk.begut, deno.sdk.chanl)
```sh
deno task test        # Format check + lint + tests
slack run             # Run locally with Slack CLI
slack deploy          # Deploy to Slack
```

## Linting/Formatting

- **JavaScript/TypeScript**: Biome (spaces, import organization)
- **Python**: Ruff (format + check)
- **Deno**: Built-in `deno fmt` and `deno lint`
- **Java**: No configured linter

## Local Development Setup

Some apps reference local Slack library clones from a sibling `../tools` directory:
```
sandbox/          # This repo
  py.bolt.snaek/
  py.sdk.sdkai/
tools/            # Sibling directory
  bolt-python/
  python-slack-sdk/
```

## Environment Configuration

Apps use `.env` files for credentials (see `.env.example` in each project). Common variables:
- `SLACK_BOT_TOKEN` - Bot user OAuth token
- `SLACK_APP_TOKEN` - App-level token for Socket Mode
- `SLACK_SIGNING_SECRET` - Request verification
- `SLACK_CONFIG_DIR` is set to `~/.config/slack` in Nix shells
- Workflow tokens are configured at repository level for GitHub Actions

## Architecture

### Workflows

- `samples.yml` - Tests and deploys apps. Runs `synchronize` job first (pushes to `zimeg/slacks` branches), then `publish` job (tests and deploys).
- `dependencies.yml` - Updates flake locks. Creates PR with auto-merge instead of pushing to main.

### Self-Hosted Runners

Apps run on NixOS self-hosted runner (`tom`). Deploy hooks restart services via polkit (not sudo). The runner user has polkit rules allowing `systemctl restart` for specific services.

### Deploy Hooks

Located in `{app}/.slack/hooks.json`. The `deploy` hook runs after `slack deploy`:
```json
{
  "hooks": {
    "deploy": "systemctl restart snaek.service"
  }
}
```

### Downstream Repo

The `synchronize` job pushes each app to `zimeg/slacks` as separate branches. Services on tom pull from these branches (e.g., `github:zimeg/slacks/py.bolt.snaek`).
