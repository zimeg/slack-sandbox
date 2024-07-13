# 🎙️ chanl

Ephemeral channel creation using the [Deno Slack SDK][sdk] to experiment with
bot messaging in a place without much noise.

https://github.com/user-attachments/assets/5bebd413-9a9c-407c-ba8c-446b32ae21d3

## Supported workflows

A series of [Slack functions][functions] in automation set a set of steps in
motion:

- **Create a channel**: Create a custom channel using a clicked link.
- **Archive a channel**: Archive that channel with a button press.

## Readying the application

Some setup is needed before creating channels for use in the near short term.
Further configurations follow!

### Installing the CLI

The Slack CLI is a tool that makes managing Slack apps easier.
[Install it before continuing onwards][cli].

### Deploying to a team

Clone the application code and navigate to this directory, then deploy the app:

```sh
$ slack create chanl -t zimeg/slacks -b deno.sdk.chanl
$ cd chanl
$ slack deploy
```

## Creating channels

The **Create a channel** workflow makes a new channel with a few configurations
before inviting the kind creator.

### Creating a trigger

This workflow begins at the press of button. Or click of a link. Create a link
trigger with the following command:

```sh
$ slack trigger create --trigger-def triggers/create_channel.ts
```

Then paste this link into Slack and create an ephemeral channel!

### Naming the channels

The default ephemeral channel name is **#slack-sandbox-spam** and is followed
with the timestamp of creation if duplicates exist. Someone recommends creating
this channel prior to running the workflow and sharing the link trigger for
quick future findings.

Default channel names can be changed from the `triggers/create_channel.ts` file.

## Archiving channels

The **Archive a channel** workflow marks the created channel as archived to hide
leftover messages from past tests.

Starting archivals is left to members of the channel while the option to remains
towards the pinned top of channel.

### Creating a trigger

This workflow starts on channel creation and finishes after pressing a specific
button. Listen for ephemeral channels:

```sh
$ slack trigger create --trigger-def triggers/archive_channel.ts
```

An event trigger will soon respond to [message metadata][metadata] that signals
channel creation.

[cli]: https://api.slack.com/automation/cli/install
[functions]: https://api.slack.com/automation/functions
[metadata]: https://api.slack.com/metadata
[sdk]: https://github.com/slackapi/deno-slack-sdk
