# AGENTS.md

Instructions for AI agents working on this project.

## Architecture

A Bolt for Python LLM chat bot with Ollama. Uses Socket Mode with listener/handler registration. Entry point is `app.py`.

## Commands

```sh
make test          # format check + lint + type check
make lint          # format and lint with ruff
make schema        # validate manifest against schema
make clean         # remove cache files
python3 app.py     # run the app
```
