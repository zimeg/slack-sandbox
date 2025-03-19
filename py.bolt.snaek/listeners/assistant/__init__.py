from logging import Logger

from slack_bolt import App, Assistant, Say
from slack_sdk import WebClient

from models.respond import response_generate
from shared.types import ChatEvent

assistant = Assistant()


@assistant.thread_started
def start_assistant_thread(
    say: Say,
):
    say("whatssss going on?")


@assistant.user_message
def user_message_callback(
    client: WebClient,
    event: ChatEvent,
    logger: Logger,
) -> None:
    response_generate(client, event, logger, stream=False)


def register(
    app: App,
) -> None:
    app.use(assistant)
