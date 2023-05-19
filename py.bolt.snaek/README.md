# 🐍 snaek

A strange and slithery app with some superb powers. Depending on who you ask.

Setup using [Bolt for Python][Bolt].

## Getting started

### Setting up the development environment

1. Make sure Python 3.10.6 is installed with `python3 --version`
2. Ensure a local copy of Bolt is cloned to `../../tools/bolt-python`
3. Create a virtual environment with `python3 -m venv .venv`
4. Instantiate the virtual environment with `source .venv/bin/activate`
5. Install all dependencies with `pip3 install -r requirements.txt`

### Creating an app for testing

1. [Create a new app][apps] using the `manifest.yaml`
2. Add tokens and other variables to the `.env` file

## Running the app

Spin up a local server using `python3 app.py`

<!-- a collection of links -->
[Bolt]: https://github.com/slackapi/bolt-python
[apps]: https://api.slack.com/apps
