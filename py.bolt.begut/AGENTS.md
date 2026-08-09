# AGENTS.md

Instructions for AI agents working on this project.

## Architecture

A Bolt for Python app that forwards email digests from Slack to a git wiki.

### Flow

1. **Forward**: Surge posts a file in the incoming channel. The bot downloads the markdown, saves it to a staging wiki repo on a `review/{ts}` branch, posts a review message with a title input and publish button to the outgoing channel, and links back to the incoming thread.
2. **Edit**: Thread replies in the outgoing channel update the markdown on the review branch.
3. **Publish**: The publish button squash merges the review branch to master, renames the draft to `Announcements/{slug}.md`, prepends an entry to `Announcements.md`, pushes to staging and production remotes, then deletes the review branch.

### Structure

```
app.py                          # entrypoint
src/
  config.py                     # env vars
  listeners/__init__.py         # registers Slack listeners and routes events
  handlers/
    forward.py                  # incoming channel file share -> outgoing channel
    edit.py                     # thread reply -> staging wiki branch
    publish.py                  # publish button -> merge to master
  store/
    git.py                      # atomic git primitives (clone, fetch, checkout, commit, push)
    repos.py                    # Repos class composing git primitives (draft, publish)
```

### Remotes

- **Staging** (`git@git.o526.net:etime.wiki.git`): review branches and master
- **Production** (`git@github.com:zimeg/emporia-time.wiki.git`): master pushed on publish

### Reactions as state

- `:zap:` on incoming message: file has been forwarded (prevents duplicates)
- `:fax:` on edit reply: markdown has been updated on staging
- `:truck:` on outgoing review message: post has been published (prevents re-publish)

### Conventions

- Draft files are named `{ts}.md` where `ts` is the review message timestamp
- The `created` timestamp from the Slack file is encoded in the publish button value as `{ts}|{created}`
- Wiki entries follow `- [Title](Slug) YYYY.MM.DD` format in `Announcements.md`
- Git commits use conventional commits: `docs:` for drafts, `chore:` for publishes

## Commands

```sh
task test    # format check + lint + type check
task lint    # format and lint with ruff
```

## Environment

All config comes from env vars. See `.env.example` for required values. The app runs in a Nix flake dev shell with go-task, ruff, and the Slack CLI.
