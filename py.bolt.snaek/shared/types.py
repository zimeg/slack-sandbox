from typing import Literal, Optional, TypedDict


class AssistantThreadContext(TypedDict):
    channel_id: str
    team_id: str
    enterprise_id: Optional[str]
    force_search: bool


class AssistantThread(TypedDict):
    user_id: str
    context: AssistantThreadContext
    channel_id: str
    thread_ts: str


class AssistantThreadStartedEvent(TypedDict):
    type: Literal["assistant_thread_started"]
    assistant_thread: AssistantThread
    event_ts: str


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
