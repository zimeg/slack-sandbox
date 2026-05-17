from datetime import datetime, timezone

from src.config import SLACK_CHANNEL_ID_OUTGOING, SLACK_USER_ID_BOT, WIKI_BASE
from src.store.repos import Repos


def handle_publish(ack, body, client, repos: Repos):
    """Handle 'Publish' button - squash merge review branch to master."""
    ack()
    thread_ts = body["message"].get("thread_ts", body["message"]["ts"])

    reactions = client.reactions_get(
        channel=SLACK_CHANNEL_ID_OUTGOING,
        timestamp=thread_ts,
    )
    for reaction in reactions.get("message", {}).get("reactions", []):
        if reaction.get("name") == "truck":
            if SLACK_USER_ID_BOT in reaction.get("users", []):
                client.chat_postEphemeral(
                    channel=SLACK_CHANNEL_ID_OUTGOING,
                    user=body["user"]["id"],
                    thread_ts=body["message"]["ts"],
                    text=":mega: This post has been published.",
                )
                return

    client.reactions_add(
        channel=SLACK_CHANNEL_ID_OUTGOING,
        timestamp=thread_ts,
        name="truck",
    )

    value = body["actions"][0]["value"]
    ts, created_str = value.split("|", 1)
    date = datetime.fromtimestamp(int(created_str), tz=timezone.utc).strftime(
        "%Y.%m.%d"
    )
    title = body["state"]["values"]["title_block"]["title"]["value"] or ""

    full_title = repos.publish(ts, title, date)
    slug = full_title.replace(" ", "-")
    wiki_url = f"{WIKI_BASE}/{slug}"

    client.chat_postMessage(
        channel=SLACK_CHANNEL_ID_OUTGOING,
        thread_ts=body["message"]["ts"],
        text=f":checkered_flag: Published! <{wiki_url}|{full_title}>",
    )
