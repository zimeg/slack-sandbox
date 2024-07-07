from typing import Literal, Optional, TypedDict


class ChatEvent(TypedDict):
    channel: str
    channel_type: Optional[Literal["channel", "group", "im", "mpim"]]  # Message events
    event_ts: str
    team: str
    text: str
    thread_ts: Optional[str]
    ts: str
    type: Literal["message", "app_mention"]
    user: str


class ModelMessage(TypedDict):
    role: Literal["user", "assistant"]
    content: str
