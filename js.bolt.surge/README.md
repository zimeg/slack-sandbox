# 🛰️ surge

An email organizer that moves the right messages across channels from the sights
of a satellite. Powered with [Bolt for JavaScript][bolt] on [Heroku][heroku].

> 🔗 [**https://surgem.ai/**][surgemail]

## Getting started

Development with the [Slack CLI][cli] is encouraged but requires customization:

```sh
$ slack create surge -t zimeg/slacks -b js.bolt.surge
$ cd surge
$ SLACK_ENVIRONMENT_TAG="development" slack run    # Local development
$ SLACK_ENVIRONMENT_TAG="production" slack deploy  # Push to production
$ npm run logs                                     # Inspect activities
```

### Configuring stages

Different apps use credentials that change and app manifests might not be the
same.

Learn about different environments from the `.env.example` file and `manifest`
path.

### Managing infrastructure

The servers that run a production instance of this app require additional tools
and your own credentials:

- Install [OpenTofu][opentofu] to handle infrastructure updates
- Use the [Heroku CLI][heroku.cli] to gather an API token

Details on preparing infrastrcture are outlined in [`infra/README.md`][infra].

## Project structure

### `infra/main.tf`

Initializations for the infrastructure providers. Other files in this directory
provide details on server setups.

### `src/app.js`

The entry point into this application. Other app logic can also be found in this
directory.

### `manifest/manifeset.*.json`

The coded configurations and subtle settings of a Slack app. Updates to this
file are automatically applied to an app installation when using the `run` or
`deploy` commands of the Slack CLI.

### `slack.json`

Hooks that the CLI uses to interact with this project and the associated SDK.

[bolt]: https://github.com/slackapi/bolt-js
[cli]: https://api.slack.com/automation/cli
[heroku]: https://www.heroku.com/dynos
[heroku.cli]: https://devcenter.heroku.com/articles/heroku-cli
[infra]: ./infra/README.md
[opentofu]: https://opentofu.org/docs/intro/install
[surgemail]: https://surgem.ai/
