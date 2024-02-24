import os

from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler

from snippets import register_snippets

app = App(token=os.environ.get("SLACK_BOT_TOKEN"))

register_snippets(app)

if __name__ == "__main__":
    SocketModeHandler(app, os.environ["SLACK_APP_TOKEN"]).start()
