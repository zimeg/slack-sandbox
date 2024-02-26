from logging import Logger

from slack_bolt import BoltContext
from slack_sdk import WebClient

from database.manager import Database
from events.app_mention import app_mention_check


def message_wrapper(db: Database):
    def message_callback(
        client: WebClient,
        context: BoltContext,
        event,
        logger: Logger,
    ):
        if event.get('subtype', False):
            return
        is_app_mention = app_mention_check(context, event)
        is_following, thread_ts = db.threads_following_check(event)
        if event['channel_type'] == 'im':
            if not is_following:
                db.threads_following_watch(event)
        elif not is_following or is_app_mention:
            return
        client.chat_postMessage(
            channel=event['channel'],
            thread_ts=thread_ts,
            text="how interesting...",
        )
    return message_callback
