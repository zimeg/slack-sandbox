from logging import Logger
from typing import List

from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from shared.types import ChatEvent, ModelMessage


def put_message(
    client: WebClient,
    channel_id: str,
    message_ts: str | None,
    thread_ts: str,
    content: str,
    logger: Logger,
    metadata: dict | None = None,
) -> str | None:
    if content == "":
        return message_ts
    try:
        if message_ts is None:
            response = client.chat_postMessage(
                channel=channel_id,
                thread_ts=thread_ts,
                text=content,
                metadata=metadata,
            )
            message_ts = response["ts"]
        else:
            client.chat_update(
                channel=channel_id,
                ts=message_ts,
                text=content,
                metadata=metadata,
            )
        return message_ts
    except SlackApiError as e:
        logger.error("An error occured with the Slack API", exc_info=e)
        return message_ts


def get_message_thread(
    client: WebClient, event: ChatEvent, logger: Logger
) -> List[ModelMessage]:
    try:
        return [
            {
                "role": "assistant" if "bot_id" in message else "user",
                "content": message["text"],
            }
            for data in client.conversations_replies(
                channel=event["channel"],
                ts=get_event_thread_ts(event),
            )
            for message in data["messages"]
        ]
    except SlackApiError as e:
        logger.error("An error occured with the Slack API", exc_info=e)
        return [{"role": "user", "content": event["text"]}]


def get_event_thread_ts(event: ChatEvent) -> str:
    thread_ts = event.get("thread_ts")
    if thread_ts is None:
        return event["ts"]
    return thread_ts
