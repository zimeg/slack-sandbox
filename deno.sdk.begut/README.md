# 💰 begut

Receipts and other expenses stored for bucketed budgets a la the
[Deno Slack SDK][sdk].

## Supported workflows

Interactions with this piggy bank are facilitated by the following workflows:

- **Submit receipt**: Save information about a past payment.

## Readying the application

Some preparation is required before managing any symbols that might represent
money. Further configurations follow!

### Installing the CLI

The Slack CLI is a tool that makes managing Slack apps easier.
[Install it before continuing onwards][cli].

### Deploying to a team

Clone the application code and navigate to this directory, then deploy the app:

```sh
$ slack create begut -t zimeg/slacks -b deno.sdk.begut
$ cd begut
$ slack deploy
```

## Storing expenses

The **Submit receipt** workflow gathers information about a past payment and
saves it to the **expenses** datastore.

### Creating a trigger

This workflow begins at the press of button. Or click of a link. Create a link
trigger with the following command:

```sh
$ slack trigger create --trigger-def triggers/submit_receipt.ts
```

Then paste this link into Slack to start saving your spendings!

### Configuring the categories

The various types of expenses that can be stored are separated into categories
that can be customized.

Update these labels and values from the [`datastores/expeneses.ts`][expenses]
file.

[cli]: https://api.slack.com/automation/cli/install
[expenses]: ./datastores/expenses.ts
[sdk]: https://github.com/slackapi/deno-slack-sdk
