import logging
import os

from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler

from src.config import WIKI_REMOTE_PRODUCTION, WIKI_REMOTE_STAGING
from src.listeners import register_listeners
from src.store.repos import Repos

logging.basicConfig(level=logging.DEBUG)

app = App(token=os.environ.get("SLACK_BOT_TOKEN"))
repos = Repos(
    staging=WIKI_REMOTE_STAGING,
    production=WIKI_REMOTE_PRODUCTION,
)

register_listeners(app, repos)

if __name__ == "__main__":
    SocketModeHandler(app, os.environ["SLACK_APP_TOKEN"]).start()
