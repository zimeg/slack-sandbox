# 🛰️ Surge

Infrastructure configurations to deploy a [Bolt for JavaScript][bolt] app on
Heroku.

Showcasing some features of Slack automations from the sights of a satellite.

## Getting started

Development with the [Slack CLI][cli] is encouraged but requires customization:

```sh
$ slack create surge --template zimeg/slack-sample-example --branch surge
$ cd surge
$ slack run     # Local development
$ slack deploy  # Push to production
```

### Managing infrastructure

The servers that run a production instance of this app require additional tools
and your own credentials:

- Install [OpenTofu][opentofu] to handle infrastructure updates
- Use the [Heroku CLI][hcli] to gather an API token

Details on preparing infrastrcture are outlined in [`infra/README.md`][infra].

### Setting up without the CLI

Setup without the Slack CLI can also be accomplished in a few more steps.

#### Preparing the project

Prepare the project and dependencies with the following commands:

```sh
$ git clone --single-branch --branch surge https://github.com/zimeg/slack-sample-example surge
$ cd surge
$ npm install
```

#### Creating a new Slack app

Preparing the app can also happen from the App Config:

1. Copy the contents of `manifest.json` for when you [create a new app][new]
2. Select the workspace to install this application in
3. Review and apply manifest configurations before clicking *Create*
4. Install the app to your workspace
5. Navigate to the App Config dashboad to gather more credentials

#### Gathering environment variables

Store the tokens needed to run your app in a secret place:

1. Rename `.env.example` to `.env` and edit that new file
2. Create an app token with `connections:write` scopes under *Basic Information*
3. Gather the bot token from the *OAuth & Permissions* page
4. Export these variables into your current shell environment

#### Calling useful commands

Run some of the following commands once everything is ready:

- `npm run start`: Run the app on the current machine
- `npm run bundle`: Package the application code for deployment
- `npm run deploy`: Push local changes to a production environment
- `npm run lint`: Lint and format the application code
- `npm run clean`: Remove dependencies and build artifacts

The most current information can be found in `package.json`.

## Project structure

### `infra/main.tf`

Initializations for the infrastructure providers. Other files in this directory
provide details on server setups.

### `src/app.js`

The entry point into this application. Any other logic can also be found in this
directory.

### `manifest.json`

The coded configurations and subtle settings of a Slack app. Updates to this
file are automatically applied to an app installation when using the `run` or
`deploy` commands of the Slack CLI.

### `slack.json`

Hooks that the CLI uses to interact with this project and the associated SDK.

<!-- a collection of links -->
[bolt]: https://github.com/slackapi/bolt-js
[cli]: https://api.slack.com/automation/cli
[hcli]: https://devcenter.heroku.com/articles/heroku-cli
[infra]: ./infra/README.md
[new]: https://api.slack.com/apps?new_app=1
[opentofu]: https://opentofu.org/docs/intro/install
