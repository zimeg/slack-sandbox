from logging import Logger
from typing import Callable

from slack_bolt import BoltContext
from slack_sdk import WebClient

from database.manager import Database
from models.respond import response_generate
from shared.types import ChatEvent

from .app_mention import app_mention_check


def message_wrapper(
    db: Database,
) -> Callable[[WebClient, BoltContext, ChatEvent, Logger], None]:
    def message_callback(
        client: WebClient,
        context: BoltContext,
        event: ChatEvent,
        logger: Logger,
    ) -> None:
        if event.get("subtype", False):
            return
        is_app_mention = app_mention_check(context, event)
        is_following, _ = db.threads_following_check(event)
        if event["channel_type"] == "im":
            if not is_following:
                db.threads_following_watch(event)
        elif not is_following or is_app_mention:
            return
        response_generate(client, event, logger)

    return message_callback
