from logging import Logger
from typing import List

from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from shared.types import ChatEvent, ModelMessage


def get_message_thread(
    client: WebClient,
    channel_id: str,
    message_text: str,
    thread_ts: str,
    logger: Logger,
) -> List[ModelMessage]:
    try:
        return [
            {
                "role": "assistant" if "bot_id" in message else "user",
                "content": message["text"],
            }
            for data in client.conversations_replies(
                channel=channel_id,
                ts=thread_ts,
            )
            for message in data.get("messages", [])
        ]
    except SlackApiError as e:
        logger.error("An error occured with the Slack API", exc_info=e)
        return [{"role": "user", "content": message_text}]


def get_event_thread_ts(event: ChatEvent) -> str:
    thread_ts = event.get("thread_ts")
    if thread_ts is None:
        return event["ts"]
    return thread_ts
