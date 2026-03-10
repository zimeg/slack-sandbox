from logging import Logger

from slack_bolt import App, Assistant, BoltContext, SetSuggestedPrompts
from slack_sdk import WebClient

from agent.respond import response_generate
from shared.types import AssistantThreadStartedEvent, ChatEvent

assistant = Assistant()


@assistant.thread_started
def start_assistant_thread(
    client: WebClient,
    context: BoltContext,
    event: AssistantThreadStartedEvent,
    logger: Logger,
    set_suggested_prompts: SetSuggestedPrompts,
):
    thread = event["assistant_thread"]
    greeting: ChatEvent = {
        "channel": thread["channel_id"],
        "channel_type": "im",
        "event_ts": event["event_ts"],
        "team": thread["context"]["team_id"],
        "text": "Greet a wondering traveler with fortelling options",
        "thread_ts": thread["thread_ts"],
        "ts": thread["thread_ts"],
        "type": "message",
        "user": thread["user_id"],
    }
    response_generate(client, context, greeting, logger, thinking=False)
    set_suggested_prompts(
        title="Take quick action",
        prompts=[
            {
                "title": "Catch the times",
                "message": "What time is it?",
            },
        ],
    )


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
