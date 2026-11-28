# AGENTS.md

Instructions for AI agents working on this project.

## Architecture

A Deno Slack SDK app for ephemeral channel creation. Manifest-driven with
`manifest.ts`. Workflows in `workflows/` and triggers in `triggers/`.

## Commands

```sh
deno task test    # format check + lint
slack run         # run locally with the Slack CLI
slack deploy      # deploy to Slack
```
