from slack_bolt import Ack
from slack_sdk import WebClient


def handle_feedback(ack: Ack, client: WebClient, body: dict) -> None:
    ack()
    channel = body["channel"]["id"]
    ts = body["message"]["ts"]
    user = body["user"]["id"]
    value = body["actions"][0]["value"]
    emoji = ":snake:" if value == "positive" else ":eagle:"
    client.chat_postEphemeral(
        channel=channel,
        user=user,
        text=emoji,
        thread_ts=ts,
    )
