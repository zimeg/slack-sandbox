from slack_bolt import App

from .proctor_quiz import create_quiz, handle_block_action

def register(app: App):
    app.message("quiz")(create_quiz)
    app.action("radio_buttons-action")(handle_block_action)
