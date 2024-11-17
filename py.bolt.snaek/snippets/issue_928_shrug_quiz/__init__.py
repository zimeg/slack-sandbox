from slack_bolt import App

from .proctor_quiz import create_quiz, handle_quiz_answer


def register(app: App):
    app.message("quiz")(create_quiz)
    app.action("radio_buttons-action")(handle_quiz_answer)
