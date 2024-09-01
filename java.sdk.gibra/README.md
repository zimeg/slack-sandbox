# ☕️ Gibra

A caffeinated app using [Gradle][gradle] and the [Slack SDK for Java][sdk].

## Getting started

Depending on the path of the sun, this app behaves in different ways. Scripted
tasks with Slack [API methods][methods] can be tried as individual processes or
listening processes can wait for events with Bolt and the [Slack CLI][cli]:

```sh
$ slack run     # Start the Bolt app
$ slack deploy  # Call an API method
```

The implemented methods available as scripts can be found in [`api`][api] files.

## Configuring apps

Both of the above commands use the same app and app ID! This is optional and not
recommended for production but I find it interersting for testing.

[api]: https://github.com/zimeg/slack-sandbox/tree/main/java.sdk.gibra/src/main/java/gibra/api
[cli]: https://api.slack.com/automation/cli
[gradle]: https://docs.gradle.org/current/userguide/what_is_gradle.html
[methods]: https://api.slack.com/methods
[sdk]: https://github.com/slackapi/java-slack-sdk
[installation]: https://slack.dev/java-slack-sdk/guides/web-api-client-setup#build-from-source
