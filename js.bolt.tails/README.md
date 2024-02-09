# 🪁 Tails

This app contains typed testings of [Bolt for JavaScript][boltjs] and runs with
the [CLI Hooks][hooks].

## Spinning up

1. Install dependencies with `npm install` and download [the Slack CLI][cli].
2. Use `npm run watch` to transpile changes to source code.
3. Use `slack run` to reflect changes during development. Restarts required.

## Setting the SDK versions

This app uses the `@slack/bolt` package to power app functionalities and the
`@slack/cli-hooks` package to make development easier.

Either package version can be updated in the `package.json` to reference a local
copy:

```sh
$ npm install ../../tools/bolt-js
$ npm install ../../tools/node-slack-sdk/packages/cli-hooks --save-dev
```

After making changes to a local copy, a rebuild of the package and app might be
needed. Sometimes a fresh start helps too:

```sh
$ npm run refresh
```

## Documentation

- https://slack.dev/bolt-js/concepts
- https://slack.dev/bolt-js/reference

[apps]: https://api.slack.com/apps
[boltjs]: https://github.com/slackapi/bolt-js
[cli]: https://api.slack.com/automation/cli
[hooks]: https://github.com/slackapi/node-slack-sdk/tree/main/packages/cli-hooks
