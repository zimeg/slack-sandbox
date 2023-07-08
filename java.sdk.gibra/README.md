# ☕️ Gibra

A caffeinated app using [Gradle][gradle] and the [Slack SDK for Java][sdk].

## Getting started

### Setting up the development environment

#### Creating a new app

Upload the `manifest.json` when [creating a new app][create] for preconfigured
settings and scopes.

#### Preparing environment variables

Move the `.env.sample` file to `.env` and update any secret variables.

#### Preparing the SDK

> ⚠️ This is currently under construction and can be ignored! Inspect the
> `build.gradle` for more information.

This project depends on a local copy of the SDK being built from source.
Instructions [from the docs][installation] recommend these steps:

```sh
git clone git@github.com:slackapi/java-slack-sdk.git
cd java-slack-sdk
mvn install -Dmaven.test.skip=true
```

### Running the snippets

The `main` method can be run using `gradle run` from the root directory. Without
other arguments, this will list snippets available to execute.

A specific snippet can be called by providing the name with the `-Pargs` flag:

```sh
$ gradle run -Pargs="Issue1179ConversationHistory,C04CRUE6MU3"
```

Required arguments will be noted as needed. Running a snippet will note these.

<!-- a collection of links -->
[gradle]: https://docs.gradle.org/current/userguide/what_is_gradle.html
[sdk]: https://github.com/slackapi/java-slack-sdk
[create]: https://api.slack.com/apps
[installation]: https://slack.dev/java-slack-sdk/guides/web-api-client-setup#build-from-source
