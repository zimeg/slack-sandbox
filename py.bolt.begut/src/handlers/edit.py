from slack_sdk import WebClient

from src.config import SLACK_CHANNEL_ID_OUTGOING
from src.store.repos import Repos


def handle_edit(client: WebClient, event: dict, repos: Repos) -> None:
    """Handle thread replies with updated markdown in review threads."""
    if event.get("subtype"):
        return

    if event.get("channel") != SLACK_CHANNEL_ID_OUTGOING:
        return

    thread_ts = event.get("thread_ts")
    if not thread_ts:
        return

    text = event.get("text", "").strip("`").strip()
    if not text:
        return

    repos.draft(thread_ts, text)

    client.reactions_add(
        channel=SLACK_CHANNEL_ID_OUTGOING,
        timestamp=event["ts"],
        name="fax",
    )
