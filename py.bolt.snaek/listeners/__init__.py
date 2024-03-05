from slack_bolt import App

from database.manager import Database
from listeners import events


def register_listeners(app: App, db: Database) -> None:
    events.register(app, db)
