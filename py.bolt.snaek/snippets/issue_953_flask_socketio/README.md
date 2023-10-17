# Socket Mode with Flask SocketIO

A Slack app using Socket Mode with a Flask-SocketIO app in a daemon thread!

## Setup

1. Make sure something close to Python 3.10.6 is installed: `python3 --version`
2. Create a virtual environment `python3 -m venv .venv`
3. Active the virtual environment: `source .venv/bin/activate`
4. Install dependencies: `pip3 install -r requirements.txt`
5. Add tokens as environment variables: `mv .env.example .env && vim .env`
6. Start the Flask app in a thread and the Slack app : `python3 app.py`

## Usage

- Mention the bot in a channel to test the Slack app
- Visit `http://127.0.0.1:5001` in your favorite browser to test Flask

## Notes

Trying to run the Flask app in the dameon thread would error with a:

```sh
ValueError: signal only works in main thread of the main interpreter
```
