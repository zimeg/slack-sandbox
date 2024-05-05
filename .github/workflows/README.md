# 🐙 workflows

The service known as [GitHub Actions][action] provides computing close to code.

This repository and projects within make use of Actions for general upkeep and
ongoing maintenance.

## Slack GitHub Action

The [Slack GitHub Action][slack] is used within the `message.yml` workflow and
others for sharing updates about the repository.

A manifest to describe the bot posting messages can be found in `manifest.json`.

## Credentials

Tokens required for workflows to succeeded are listed in `.env.example`. These
tokens should be added at the repository level.

[action]: https://github.com/features/actions
[slack]: https://github.com/slackapi/slack-github-action
