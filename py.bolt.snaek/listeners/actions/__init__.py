from slack_bolt import App

from .feedback import handle_feedback


def register(app: App) -> None:
    app.action("feedback")(handle_feedback)
