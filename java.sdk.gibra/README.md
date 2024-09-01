# ☕️ Gibra

A caffeinated app using [Gradle][gradle] and the [Slack SDK for Java][sdk].

## Getting started

Depending on the path of the sun, this app behaves in different ways. Scripted
tasks with Slack [API methods][methods] can be tried as individual processes or
listening processes can wait for events with Bolt:

```sh
$ SLACK_APP_MODE="bolt" gradle run
$ SLACK_APP_MODE="api" gradle run -Pargs="-method files.upload -filepath ./README.md -channel C0123456789"
```

## Additional setup

Before attempting the above, a few more changes are needed. For now:

- Update the environment variables found in `.env.example`
- Create an app using the included `manifest.json`

[gradle]: https://docs.gradle.org/current/userguide/what_is_gradle.html
[methods]: https://api.slack.com/methods
[sdk]: https://github.com/slackapi/java-slack-sdk
[installation]: https://slack.dev/java-slack-sdk/guides/web-api-client-setup#build-from-source
