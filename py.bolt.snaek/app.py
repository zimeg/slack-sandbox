import logging
import os

from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler

from database.manager import Database
from listeners import register_listeners

app = App(token=os.environ.get("SLACK_BOT_TOKEN"))
db = Database(path="caduceus.db")

register_listeners(app, db)
logging.basicConfig(level=logging.INFO)

if __name__ == "__main__":
    SocketModeHandler(app, os.environ["SLACK_APP_TOKEN"]).start()
