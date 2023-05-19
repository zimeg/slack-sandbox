# 👾 SDKAI

A Python app that interfaces with the [SDK][SDK].

## Getting started

### Setting up the development environment

1. Make sure Python 3.10.6 is installed with `python3 --version`
2. Ensure a local SDK is cloned to `../../tools/python-slack-sdk`
3. Create a virtual environment with `python3 -m venv .venv`
4. Instantiate the virtual environment with `source .venv/bin/activate`
5. Install all dependencies with `pip3 install -r requirements.txt`

### Creating an app for testing

1. [Create a new app][apps] using the `manifest.yaml`
2. Add tokens and other variables to the `.env` file

## Samples and snippets

Small scripts meant for testing various functionalities can be found in the
`./snippets` directory. Specifics of each file can be found there too.

<!-- a collection of links -->
[SDK]: https://github.com/slackapi/python-slack-sdk
[apps]: https://api.slack.com/apps
