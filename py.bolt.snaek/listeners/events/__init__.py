from slack_bolt import App

from database.manager import Database
from .app_mention import app_mention_wrapper
from .message import message_wrapper


def register(app: App, db: Database):
    app.event("app_mention")(app_mention_wrapper(db))
    app.event("message")(message_wrapper(db))
