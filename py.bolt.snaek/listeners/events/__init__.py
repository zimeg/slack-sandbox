from slack_bolt import App

from .app_mention import app_mention_wrapper
from .message import message_wrapper
from database.manager import Database


def register(app: App, db: Database) -> None:
    app.event("app_mention")(app_mention_wrapper(db))
    app.event("message")(message_wrapper(db))
