# surge

An email reader that converts incoming messages into markdown, delivered to channels around. Powered with [Bolt for JavaScript](https://docs.slack.dev/tools/bolt-js/) on [Vercel](https://vercel.com/) and [Anthropic](https://www.anthropic.com/).

> [**https://surgem.ai/**](https://surgem.ai/)

<img src="./assets/icon.png" title="surge scans signals" alt="a satellite in orbit" width="400" height="400" />

## Getting started

Development with the [Slack CLI](https://docs.slack.dev/tools/slack-cli/) is encouraged but requires customization:

```sh
$ slack create surge -t zimeg/slacks -b surge
$ cd surge
$ npm install
$ npm run dev         # Local development
$ npm run build       # Build for production
```

### Configuring stages

Different apps use credentials that change and app manifests might not be the same.

Learn about different environments from the `.env.*.example` files and `manifest.*.json` files.

## Project structure

### `server/app.js`

The Bolt application configured for Vercel serverless with multi-workspace OAuth.

### `server/api/slack/events.post.js`

HTTP event handler that receives Slack events via the Events API.

### `server/lib/database/index.js`

Database operations using Neon Postgres for installations, credits, and usage tracking.

### `server/lib/logger.js`

Shared logger using `@slack/logger` with environment-aware log levels.

### `manifest.*.json`

The coded configurations and subtle settings of a Slack app per environment. Updates to these files are applied to an app installation when using the Slack CLI.

### `nitro.config.js`

Configuration for the Nitro server framework that powers the serverless runtime.
