# CLAUDE.md — js.bolt.surge

Project-specific learnings and patterns for the surge email app.

## Architecture

- **Vercel + Nitro**: Builds to a single `__fallback.func` serverless function. Internal routing is handled within Nitro — all routes live under `server/`.
- **`@vercel/slack-bolt`**: The `createHandler` calls `app.init()` internally. Do not call `app.init()` again or initialization will fail.
- **OAuth flow**: `authorize` function handles bot token lookup for incoming events. `InstallProvider` handles the install/callback flow. These are separate concerns and should not be mixed.
- **Preview deployments**: Disable Vercel Authentication or use `x-vercel-protection-bypass` query parameter for webhook URLs in staging manifests.

## Code Patterns

- **`jsconfig.json`**: The `types` array is an allowlist — if specified, only listed type packages are included. Use `skipLibCheck: true` for node_modules type issues.
- **Database**: Neon Postgres serverless driver (`@neondatabase/serverless`). Tables are created in the database plugin on startup. Local dev drops and recreates tables.
- **Manifests**: Per-environment files (`manifest.development.json`, `manifest.staging.json`, `manifest.production.json`). Staging uses `x-vercel-protection-bypass` params in request URLs.
- **Logging**: Use `@slack/logger` via shared `server/lib/logger.js` for server-side code. In Bolt listener callbacks, use the `logger` argument provided to the handler.
