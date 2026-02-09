import logging
import os

from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler

from database.manager import Database
from listeners import register_listeners

logging.basicConfig(level=logging.DEBUG)

app = App(token=os.environ.get("SLACK_BOT_TOKEN"))
db = Database(path=os.environ.get("DATABASE_PATH", "caduceus.db"))

register_listeners(app, db)

if __name__ == "__main__":
    SocketModeHandler(app, os.environ["SLACK_APP_TOKEN"]).start()
