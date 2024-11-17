# https://github.com/slackapi/bolt-python/issues/928

from logging import Logger

from slack_bolt import Ack
from slack_sdk import WebClient


def create_quiz(body: dict, client: WebClient, logger: Logger):
    user_id = body["event"]["user"]
    try:
        client.chat_postMessage(
            channel=user_id,
            blocks=quiz_blocks,
            text="New Question!",
            metadata={
                "event_type": "question_asked",
                "event_payload": {"expert_id": 12, "task_id": 42},
            },
        )
    except Exception as e:
        logger.error(e)


def handle_quiz_answer(ack: Ack, body: dict, client: WebClient, logger: Logger):
    ack()

    user_id = body["user"]["id"]
    channel_id = body["channel"]["id"]
    quiz_ts = body["message"]["ts"]

    selected_option = body["actions"][0]["selected_option"]
    selected_text = selected_option["text"]["text"]
    selected_value = selected_option["value"]

    print(f"{user_id} selected {selected_value}")

    try:
        client.chat_postMessage(
            channel=channel_id,
            text=f"<@{user_id}> selected the following option:\n>{selected_text}",
            thread_ts=quiz_ts,
        )
    except Exception as e:
        logger.error(e)


quiz_blocks = [
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "Time for a quiz! Compare concept `1` to `2`:",
        },
        "accessory": {
            "type": "radio_buttons",
            "options": [
                {
                    "text": {
                        "type": "plain_text",
                        "text": "Matching concepts",
                        "emoji": True,
                    },
                    "value": "value-0",
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": "Closely related concepts",
                        "emoji": True,
                    },
                    "value": "value-1",
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": "Concept 1 is more general than 2",
                        "emoji": True,
                    },
                    "value": "value-2",
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": "Concept 1 is more specific than 2",
                        "emoji": True,
                    },
                    "value": "value-3",
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": "Unrelated concepts",
                        "emoji": True,
                    },
                    "value": "value-4",
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": "\u00af\\_(\u30c4)_/\u00af",
                        "emoji": True,
                    },
                    "value": "value-5",
                },
            ],
            "action_id": "radio_buttons-action",
        },
    }
]
