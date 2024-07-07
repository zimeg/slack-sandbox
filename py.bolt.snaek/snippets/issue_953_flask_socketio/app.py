# https://github.com/slackapi/bolt-python/issues/953

import logging
import threading
import os

from dotenv import load_dotenv
from flask import Flask, render_template
from flask_socketio import SocketIO
from slack_bolt import App
from slack_bolt.adapter.socket_mode.websocket_client import SocketModeHandler

logging.basicConfig(level=logging.DEBUG)
load_dotenv()


"""
Run Slack app in a dameon thread
"""

app = App(token=os.getenv("SLACK_BOT_TOKEN"))


@app.middleware
def log_request(logger, body, next):
    logger.debug(body)
    return next()


@app.event("app_mention")
def handle_app_mentions(body, say, logger):
    logger.info(body)
    say("'sup?")


@app.event("message")
def handle_message():
    pass


def run_slack_app():
    handler = SocketModeHandler(app, os.environ["SLACK_APP_TOKEN"])
    handler.start()


slack_thread = threading.Thread(target=run_slack_app)
slack_thread.daemon = True
slack_thread.start()


"""
Run Flask app in the main thread
"""

flask_app = Flask(__name__)
flask_app.config["SECRET_KEY"] = "unknownish"
socketio = SocketIO(flask_app)


@socketio.event
def connect():
    print("Client connected")


@socketio.event
def disconnect():
    print("Client disconnected")


@flask_app.route("/")
def main_route():
    return render_template("index.html")


if __name__ == "__main__":
    socketio.run(flask_app, host="0.0.0.0", port=5001, debug=True)
