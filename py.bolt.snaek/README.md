# 🐍 snaek

A strange and slithery app with some superb powers. Depending on who you ask.

Setup using [Bolt for Python][bolt].

## Speaking with the serpent

Responses are received for any message involving this app, whether that be from
a mention, DM, or threaded reply.

Conversations might begin bland but maybe you say something interesting!

## Getting started

Development with the [Slack CLI][cli] is encouraged for simple app management.

```sh
$ slack create snaek -t zimeg/slacks -b py.bolt.snaek
$ cd snaek
$ python3 -m venv .venv
$ source .venv/bin/activate
$ pip install -r requirements.txt

$ slack run  # Local development
```

<!-- a collection of links -->
[apps]: https://api.slack.com/apps
[bolt]: https://github.com/slackapi/bolt-python
