from slack_bolt import App

from snippets import example_0000_post_message, issue_928_shrug_quiz


def register_snippets(app: App):
    example_0000_post_message.register(app)
    issue_928_shrug_quiz.register(app)
