from slack_bolt import App

from database.manager import Database
from listeners import actions, assistant, events


def register_listeners(app: App, db: Database) -> None:
    actions.register(app)
    assistant.register(app)
    events.register(app, db)
