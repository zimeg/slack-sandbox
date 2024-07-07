from logging import Logger
from typing import Callable

from slack_bolt import BoltContext
from slack_sdk import WebClient

from database.manager import Database
from models.respond import response_generate
from shared.types import ChatEvent


def app_mention_wrapper(
    db: Database,
) -> Callable[[WebClient, ChatEvent, Logger], None]:
    def app_mention_callback(
        client: WebClient,
        event: ChatEvent,
        logger: Logger,
    ) -> None:
        is_following, _ = db.threads_following_check(event)
        if not is_following:
            db.threads_following_watch(event)
        response_generate(client, event, logger)

    return app_mention_callback


def app_mention_check(context: BoltContext, event: ChatEvent) -> bool:
    return f"<@{context.bot_user_id}>" in event["text"]
