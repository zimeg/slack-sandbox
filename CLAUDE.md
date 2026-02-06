# CLAUDE.md

## Git

- Never push directly to main
- Always create PRs from feature branches

## Pull Requests

- Always add relevant labels (use `gh label list` to see available)
- Use a single emoji in the PR body (e.g., `:hamsa:`, `:space_invader:`)
- Use lowercase for PR titles
- When merging with `gh pr merge`, use `--auto` to wait for CI - never `--admin`

## Architecture

Each subdirectory is a separate Slack app with its own flake:
- `deno.sdk.*` - Deno SDK apps
- `java.sdk.*` - Java SDK apps
- `js.bolt.*` - JavaScript Bolt apps
- `py.bolt.*` - Python Bolt apps

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
