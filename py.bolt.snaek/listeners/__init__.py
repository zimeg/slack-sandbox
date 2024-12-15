from slack_bolt import App

from database.manager import Database
from listeners import assistant, events


def register_listeners(app: App, db: Database) -> None:
    assistant.register(app)
    events.register(app, db)
