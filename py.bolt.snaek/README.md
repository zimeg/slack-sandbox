# 🐍 snaek

A strange and slithery app with some superb powers. Depending on who you ask.

Made with [Bolt for Python][bolt] and your own language model.

## Speaking with the serpent

Responses are received for any message involving this app, whether that be from
a mention, DM, or threaded reply.

Conversations might begin bland but maybe you say something interesting!

## Getting started

Tending to your digital garden is necessary when preparing these processes.

### Selecting language models

Local large language models are available for quick setup with [Ollama][ollama].

After installing Ollama CLI, start an Ollama server for engaging conversation:

```sh
$ ollama serve
```

The prepared model is `mistral` and other available models can be found from
[the Ollama library][models].

Update the `OLLAMA_MODEL` environment variable with any model you'd like!

#### Configuring networks

Default settings serve the model on `localhost` but this can be changed to the
local network by setting the `OLLAMA_HOST` environment variable to `0.0.0.0`.

Models served on a separate machine can still be reached by the Slack app with
a change to the `OLLAMA_CLIENT` environment variable.

### Launching the application

Development with the [Slack CLI][cli] is encouraged for simple app management.

#### Preparing dependencies

Clone the application code and download additional packages:

```sh
$ slack create snaek -t zimeg/slacks -b py.bolt.snaek
$ cd snaek
$ python3 -m venv .venv
$ source .venv/bin/activate
$ pip install -r requirements.txt
```

#### Starting in Socket Mode

Running the app locally makes connecting to the Ollama server simple:

```sh
$ slack run
```

After making a connection, add the bot to a channel and start prompting!

<!-- a collection of links -->
[bolt]: https://github.com/slackapi/bolt-python
[cli]: https://api.slack.com/automation/cli
[models]: https://ollama.com/library
[ollama]: https://ollama.com
