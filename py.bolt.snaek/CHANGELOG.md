# Changelog

Most notable changes to this project will be documented in this file.

Updates follow a [conventional commit][commits] style and the project is
versioned with [calendar versioning][calver].

## Changes

- test: perform static analysis of type annotations for some safety 2024-03-05
- fix!: remove stored enterprise ids in events from chat messages 2024-03-05
- feat: swap the custom base model from mistral to the medium llama 2024-03-04
- chore: upgrade the locked version of ollama to version 0.1.27 2024-03-04
- feat: configure system prompts for more clear and concise replies 2024-03-03
- feat: retain context of the thread when generating new responses 2024-03-03
- fix: continue updating the same response after being rate limited 2024-03-03
- build: download and unpack the slack cli for ease in development 2024-02-29
- build: install latest python dependencies using a flake environment 2024-02-29
- docs: demonstrate a live response to a prompt using moving pictures 2024-02-26
- feat: generate conversational responses using large language models 2024-02-26
- chore: bump the required python version to at least 3.11 2024-02-25
- fix: import local modules without specifying the module path name 2024-02-25
- feat: thread responses to any message involving this scalable app 2024-02-25
- build: prepare a development environment using a simple nix flake 2024-02-24
- feat: respond to simple greetings in a slithery way via a CLI run 2024-02-24

<!-- a collection of links -->
[calver]: https://calver.org
[commits]: https://www.conventionalcommits.org/en/v1.0.0/
