# 🪁 Tails

This app contains typed testings of [Bolt for JavaScript][bolt_js].

## Spinning up

1. Use `npm run watch` to compile changes.
2. Use `npm run dev` to reflect changes live.
3. If running over HTTP, use `npm run ngrok`.
    * Also update the URLs on [the apps page][apps].

## Setting the SDK version

This app uses the changes found in `../../tools/bolt-js`. To reflect the latest
changes, run `npm run build` from that directory and restart the app.

## Documentation

- https://slack.dev/bolt-js/concepts
- https://slack.dev/bolt-js/reference

[apps]: https://api.slack.com/apps
[bolt_js]: https://github.com/slackapi/bolt-js
