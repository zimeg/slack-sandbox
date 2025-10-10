from logging import Logger

from slack_bolt import App, Assistant, BoltContext, Say
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
    context: BoltContext,
    event: ChatEvent,
    logger: Logger,
) -> None:
    response_generate(client, context, event, logger)


def register(
    app: App,
) -> None:
    app.use(assistant)
