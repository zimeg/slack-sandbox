from slack_bolt import App
from .chat import greeting


def register(app: App):
    app.message("hello")(greeting)
