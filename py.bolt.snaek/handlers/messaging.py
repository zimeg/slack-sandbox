from logging import Logger

from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError


def put_message(
    client: WebClient,
    channel_id: str,
    message_ts: str | None,
    thread_ts: str,
    content: str,
    logger: Logger,
    metadata: dict | None = None,
) -> str:
    try:
        if message_ts is None:
            response = client.chat_postMessage(
                channel=channel_id,
                thread_ts=thread_ts,
                text=content,
                metadata=metadata,
            )
            message_ts = response['ts']
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


def get_message_thread(client: WebClient, event, logger: Logger):
    try:
        return [
            {
                "role": "assistant" if "bot_id" in message else "user",
                "content": message['text'],
            }
            for data in client.conversations_replies(
                channel=event['channel'],
                ts=get_event_thread_ts(event),
            )
            for message in data['messages']
        ]
    except SlackApiError as e:
        logger.error("An error occured with the Slack API", exc_info=e)
        return [{"role": "user", "content": event['text']}]


def get_event_thread_ts(event) -> str:
    if event.get('thread_ts', False):
        return event['thread_ts']
    else:
        return event['ts']
