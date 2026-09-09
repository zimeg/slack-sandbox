import os
import unittest

os.environ.update(
    {
        "SLACK_CHANNEL_ID_INCOMING": "incoming",
        "SLACK_CHANNEL_ID_OUTGOING": "outgoing",
        "SLACK_USER_ID_BOT": "bot",
        "SLACK_USER_ID_MESSENGER": "messenger",
        "WIKI_BASE": "https://example.com",
        "WIKI_REMOTE_PRODUCTION": "git@example.com:production.git",
        "WIKI_REMOTE_STAGING": "git@example.com:staging.git",
    }
)

from src.handlers.forward import extract_sender_email_from_messages


class ExtractSenderEmailFromMessagesTests(unittest.TestCase):
    def test_uses_reaction_message_text_when_file_share_event_has_no_text(self) -> None:
        email = extract_sender_email_from_messages(
            {"text": ""},
            {
                "text": (
                    ":outbox_tray: From: Pacific Gas and Electric Company "
                    "<noreply@em.pge.com>\n"
                )
            },
        )

        self.assertEqual(email, "noreply@em.pge.com")
