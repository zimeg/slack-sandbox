import logging

import requests
from slack_sdk import WebClient
from slack_sdk.models.blocks import (
    ActionsBlock,
    ButtonElement,
    InputBlock,
    MarkdownTextObject,
    PlainTextInputElement,
    PlainTextObject,
    SectionBlock,
)

from src.config import (
    SLACK_CHANNEL_ID_INCOMING,
    SLACK_CHANNEL_ID_OUTGOING,
    SLACK_USER_ID_BOT,
    SLACK_USER_ID_MESSENGER,
)
from src.store.repos import Repos

logger = logging.getLogger(__name__)


def handle_forward(client: WebClient, event: dict, repos: Repos) -> None:
    """Forward a file share from the inbox to the project channel."""
    if event.get("channel") != SLACK_CHANNEL_ID_INCOMING:
        return

    msg = event.get("message", {})
    if msg.get("user") != SLACK_USER_ID_MESSENGER:
        return

    msg_ts = msg.get("ts", "")
    reactions = client.reactions_get(
        channel=SLACK_CHANNEL_ID_INCOMING,
        timestamp=msg_ts,
    )
    for reaction in reactions.get("message", {}).get("reactions", []):
        if reaction.get("name") == "zap":
            if SLACK_USER_ID_BOT in reaction.get("users", []):
                return

    client.reactions_add(
        channel=SLACK_CHANNEL_ID_INCOMING,
        timestamp=msg_ts,
        name="zap",
    )

    files = msg.get("files", [])
    file = next((f for f in files if f.get("name", "").endswith(".md")), None)
    if not file:
        return

    title = file.get("title", file.get("name", ""))
    permalink = file.get("permalink", "")
    created = file.get("created", 0)
    download_url = file.get("url_private_download", "")
    if not download_url:
        return

    resp = requests.get(
        download_url,
        headers={"Authorization": f"Bearer {client.token}"},
    )
    if not resp.ok:
        logger.warning("Failed to download file %s", file.get("id", ""))
        return

    content = resp.text

    result = client.chat_postMessage(
        channel=SLACK_CHANNEL_ID_OUTGOING,
        text=f"<{permalink}|{title}>",
    )

    review_ts = result.get("ts")
    if not review_ts:
        logger.error("No timestamp returned for review message")
        return

    repos.draft(review_ts, content)

    client.chat_postMessage(
        channel=SLACK_CHANNEL_ID_OUTGOING,
        thread_ts=review_ts,
        text=":thread: Reply in thread with updated markdown.",
        blocks=[
            SectionBlock(
                text=MarkdownTextObject(
                    text=":thread: Reply in thread with updated markdown.",
                ),
            ),
            InputBlock(
                block_id="title_block",
                label=PlainTextObject(text="Title"),
                element=PlainTextInputElement(
                    action_id="title",
                    placeholder=PlainTextObject(
                        text="Winter tips",
                    ),
                ),
            ),
            ActionsBlock(
                elements=[
                    ButtonElement(
                        text="Publish",
                        style="primary",
                        action_id="publish",
                        value=f"{review_ts}|{created}",
                    ),
                ],
            ),
        ],
    )

    thread_ts = msg.get("thread_ts", msg.get("ts", ""))
    if thread_ts:
        review_link = client.chat_getPermalink(
            channel=SLACK_CHANNEL_ID_OUTGOING,
            message_ts=review_ts,
        )
        permalink_review = review_link.get("permalink", "")
        if permalink_review:
            client.chat_postMessage(
                channel=SLACK_CHANNEL_ID_INCOMING,
                thread_ts=thread_ts,
                text=f":electric_plug: <{permalink_review}|Forwarded email to project channel>.",
            )
