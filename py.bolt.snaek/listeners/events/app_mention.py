from logging import Logger

from slack_bolt import BoltContext
from slack_sdk import WebClient

from database.manager import Database


def app_mention_wrapper(db: Database):
    def app_mention_callback(client: WebClient, event, logger: Logger):
        is_following, thread_ts = db.threads_following_check(event)
        if not is_following:
            db.threads_following_watch(event)
        client.chat_postMessage(
            channel=event['channel'],
            thread_ts=thread_ts,
            text="greetings!",
        )
    return app_mention_callback


def app_mention_check(context: BoltContext, event) -> bool:
    return f"<@{context.bot_user_id}>" in event['text']
