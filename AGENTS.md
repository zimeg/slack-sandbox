# AGENTS.md

Instructions for AI agents working with code in this repository. Projects might
include an `AGENTS.md` of their own with specific commands and patterns.

## Repository Overview

A polyglot monorepo for experimenting with Slack APIs. Contains independent projects using different Slack SDKs and frameworks. Each subdirectory is a standalone app that can be deployed independently.

## Project Structure

| Directory | Stack | Purpose |
|-----------|-------|---------|
| `deno.sdk.chanl` | Deno Slack SDK | Ephemeral channel creation |
| `java.sdk.gibra` | Java Slack SDK + Gradle + JDK 21 | API method testing |
| `js.bolt.surge` | Bolt JS + Nitro + Vercel + Neon Postgres | Email organizer |
| `js.bolt.tails` | Bolt JS + TypeScript + yt-dlp | Video archival |
| `py.bolt.begut` | Bolt Python + go-task | Email digests to a git wiki |
| `py.bolt.snaek` | Bolt Python + Ollama | LLM chat bot |
| `py.sdk.todos` | Python Slack SDK + Slack Lists | Task management CLI |

## Git

- Never push directly to main
- Always create PRs from feature branches
- Use git worktrees for parallel work

## Pull Requests

- Always add relevant labels (use `gh label list` to see available)
- Use a single emoji in the PR body (e.g., `:hamsa:`, `:space_invader:`)
- PR title format: `project(tag): description` (e.g., `js.bolt.surge(feat): add login flow`)
- When merging with `gh pr merge`, use `--auto` to wait for CI - never `--admin`
- Never force push - if a branch needs to be reset, use `@dependabot recreate` comment instead
- AGENTS.md updates should be included in regular work PRs, not separate PRs - add notes for significant learnings, errors of understanding, or long-term decisions to the root or project AGENTS.md
- If a CHANGELOG.md exists in the app directory, add an entry matching the existing format and line length
- Changelog entries should avoid dashes within words (use "flake utils" not "flake-utils") and avoid the letter "y" unless dire

## Dependabot

When Dependabot PRs need lockfile updates or other fixes:
1. Comment `@dependabot recreate` to have Dependabot recreate the PR fresh
2. Fetch and checkout the new branch
3. Make necessary changes (e.g., `npm install` to sync lockfile)
4. Commit and push (no force push needed on a fresh branch)

## Architecture Patterns

**Bolt Apps** (js.bolt.surge, js.bolt.tails, py.bolt.begut, py.bolt.snaek): Use the listener/handler registration pattern.

**Deno Apps** (deno.sdk.chanl): Manifest-driven with `manifest.ts`.

**SDK Direct** (java.sdk.gibra, py.sdk.todos): Direct API calls without Bolt framework.

## Development Commands

All apps use Nix flakes for reproducible dev environments. Enter a shell with `nix develop` in any project directory. Use `nix develop -c <command>` to run commands in the dev environment (e.g., `nix develop -c npm test`).

### Common Slack CLI Commands
```sh
slack run      # Start local development server
slack deploy   # Deploy to production
```

## Linting/Formatting

- **JavaScript/TypeScript**: Biome (spaces, import organization). If biome.json schema version doesn't match the CLI, run `biome migrate --write` to update.
- **Python**: Ruff (format + check)
- **Deno**: Built-in `deno fmt` and `deno lint`
- **Java**: No configured linter

## Local Development Setup

Some apps reference local Slack library clones from a sibling `../tools` directory:
```
sandbox/          # This repo
  py.bolt.snaek/
  py.sdk.todos/
tools/            # Sibling directory
  bolt-python/
  python-slack-sdk/
```

## Environment Configuration

Apps use `.env` files or sops `secrets.*.yaml` files for credentials. Common variables:
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

The `synchronize` job pushes each app to `zimeg/slacks` as separate branches. Services on tom pull from these branches (e.g., `github:zimeg/slacks/snaek`).
