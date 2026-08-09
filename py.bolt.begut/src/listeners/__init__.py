from slack_bolt import App

from src.handlers.edit import handle_edit
from src.handlers.forward import handle_forward
from src.handlers.publish import handle_publish
from src.store.repos import Repos


def register_listeners(app: App, repos: Repos) -> None:
    app.action("publish")(
        lambda ack, body, client: handle_publish(ack, body, client, repos)
    )
    app.event("message")(lambda client, event: handle_message(client, event, repos))


def handle_message(client, event: dict, repos: Repos) -> None:
    """Route message events to the appropriate handler."""
    subtype = event.get("subtype")

    if subtype is None:
        handle_edit(client, event, repos)
    elif subtype == "file_share":
        handle_forward(client, event, repos)
