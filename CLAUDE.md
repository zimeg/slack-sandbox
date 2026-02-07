# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Slack sandbox monorepo containing experimental apps across multiple languages/frameworks for testing Slack APIs. Each subdirectory is a standalone app that can be deployed independently.

## Project Structure

| Directory | Stack | Purpose |
|-----------|-------|---------|
| `deno.sdk.begut` | Deno Slack SDK | Budget/expense tracking |
| `deno.sdk.chanl` | Deno Slack SDK | Ephemeral channel creation |
| `java.sdk.gibra` | Java Slack SDK + Gradle | API method testing |
| `js.bolt.surge` | Bolt for JavaScript | Email organizer (Heroku) |
| `js.bolt.tails` | Bolt for JavaScript + TypeScript | Video archival with yt-dlp |
| `py.bolt.snaek` | Bolt for Python | LLM chat bot (Ollama) |
| `py.sdk.sdkai` | Python Slack SDK | SDK snippet testing |

## Git

- Never push directly to main
- Always create PRs from feature branches

## Pull Requests

- Always add relevant labels (use `gh label list` to see available)
- Use a single emoji in the PR body (e.g., `:hamsa:`, `:space_invader:`)
- Use lowercase for PR titles
- When merging with `gh pr merge`, use `--auto` to wait for CI - never `--admin`

## Development Commands

All apps use Nix flakes for reproducible dev environments. Enter a shell with `nix develop` in any project directory.

### Common Slack CLI Commands
```sh
slack run      # Start local development server (Socket Mode)
slack deploy   # Deploy to production
```

### js.bolt.surge
```sh
npm run lint        # Biome check
npm run lint:fix    # Biome fix
npm run check       # TypeScript type check
npm run test        # Run tests with c8/mocha
npm run logs        # Tail Heroku logs
```

### js.bolt.tails
```sh
npm run build       # Compile TypeScript
npm run lint        # Biome check
npm run test:ci     # Type check + lint
```

### py.bolt.snaek
```sh
make test      # Format check + lint + mypy
make lint      # ruff format + check
make schema    # Validate manifest against schema
make clean     # Remove cache directories
```

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

- Apps use `.env` files for credentials (see `.env.example` in each project)
- Workflow tokens are configured at repository level for GitHub Actions
- `SLACK_CONFIG_DIR` is set to `~/.config/slack` in Nix shells

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
