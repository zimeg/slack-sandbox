# Todo's Guide

> _toh-doh_ — like the flightless bird

The endangered task management CLI for collaboration and orchestration using [Slack Lists](https://slack.com/help/articles/27452748828179-Use-lists-in-Slack).

> 🔗 [**https://todos.guide/**](https://todos.guide/)

## Preview

```
$ todos
Overdue
! Rec0ADN3PKWMB Review the docs due: 3 days ago
Todo
· Rec0ADJT656UR Ship the feature due: today
· Rec0ADA32CE9M Write tests
· Rec0AD619U6HY Deploy to prod
```

## Commands

```sh
todos               # Show todos
todos add <title>   # Add a todo (-d YYYY-MM-DD)
todos done <id>     # Mark todo as complete
todos init          # Authenticate with Slack
```

## Setup

```sh
$ nix run github:zimeg/slacks/py.sdk.todos#todos -- init
$ nix run github:zimeg/slacks/py.sdk.todos#todos
$ nix run github:zimeg/slacks/py.sdk.todos#todos -- add "My first task"
$ nix run github:zimeg/slacks/py.sdk.todos#todos -- done Rec0ADN3PKWMB
```
