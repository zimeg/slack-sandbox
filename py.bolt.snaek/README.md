# 🐍 snaek

A strange and slithery app with some superb powers. Depending on who you ask.

Made with [Bolt for Python][bolt] and your own language model.

## Speaking with the serpent

Responses are received for any message involving this app, whether that be from
a mention, DM, or threaded reply.

https://github.com/zimeg/slack-sandbox/assets/18134219/57d4b11d-83fa-45c0-92e9-53c4c6d2e1d5

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

Update the `OLLAMA_MODEL` environment variable with any model name you'd like!

#### Customizing system prompts

Custom models can be configured and created from the `models/Modelfile` file.
Generate a new model with:

```sh
$ ollama create snaek --file models/Modelfile
```

Updates to the `Modelfile` require creating that same model again for changes
to take effect.

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
$ pip install .
```

#### Starting in Socket Mode

Running the app locally makes connecting to the Ollama server simple:

```sh
$ slack run
```

After making a connection, add the bot to a channel and start prompting!

[bolt]: https://github.com/slackapi/bolt-python
[cli]: https://api.slack.com/automation/cli
[models]: https://ollama.com/library
[ollama]: https://ollama.com
