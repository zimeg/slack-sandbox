# Changelog

Most notable changes to this project will be documented in this file.

Updates follow a [conventional commit][commits] style and the project is
versioned with [calendar versioning][calver].

## Changes

- build: slither into production serving using the nix flake command 2026-02-05
- feat: stream chat responses with loading states prior as a serpent 2025-10-08
- chore: remove deprecated parameters from the modelfile prompt file 2025-10-04
- build: update dependencies and the toolset to support python 3.13 2025-07-26
- ci: check for formatting fixes with an erroring steps in test run 2025-05-18
- build: remove obsolete machine and username in self hosted runners 2025-03-23
- build: change the model for the most popular gemma3 in this moment 2025-03-23
- fix: include integrity hashes of snippet websocket webpage example 2025-03-15
- build: update tooling for developing and the development filepaths 2025-03-15
- feat: bump model versions to the fast and recent llama 3.2 tagging 2024-12-14
- feat: unlock the assistant panel for messaging outside of channel 2024-12-14
- build: export environment variables from hidden credentials files 2024-12-14
- test: exit with an error if the slack app manifest fails validate 2024-12-14
- chore: update dependencies with added environment setup for nixos 2024-12-14
- fix: raise runtime errors returned when loading the model response 2024-09-17
- build: prefer the shared system ollama setups found on the machine 2024-09-17
- chore: update dependencies to avoid mismatched build hash problems 2024-09-17
- fix: catch timeouts before logging the general request exceptions 2024-08-24
- docs: note the rebuild needed to update the model after modelfile 2024-07-27
- chore: update the modefile to use the latest llama3.1 8bn release 2024-07-25
- fix: delay initial responses to reduce edits for buffered messages 2024-07-12
- build: set python version to 3.11 for stable setups and packaging 2024-07-12
- chore: bump versions of application dependencies and other tooling 2024-07-12
- fix: batch responses from the model to avoid reaching rate limits 2024-07-11
- fix: avoid posting or updating messages that have no text content 2024-07-11
- build: restart production system services after latest deployments 2024-07-07
- chore: update the snaek modefile to use the latest llama3 release 2024-07-07
- build: hot reload changes to files without restarting the process 2024-07-07
- build: validate json schema of the same slack project app manifest 2024-07-07
- fix: remove the outgoing domains from slack app project manifests 2024-07-07
- build: lint and format code according to ruff opinionated choices 2024-07-07
- chore: bump versions of application dependencies and other tooling 2024-07-07
- build: install and manage python dependencies with the nix flake 2024-03-17
- fix: check if a thread timestamp exists without causing key error 2024-03-07
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

[calver]: https://calver.org
[commits]: https://www.conventionalcommits.org/en/v1.0.0/
