import os
from logging import Logger
from typing import Any

from ollama import Client
from ollama._types import Message
from slack_bolt import BoltContext
from slack_sdk import WebClient
from slack_sdk.models.blocks import (
    ContextActionsBlock,
    FeedbackButtonObject,
    FeedbackButtonsElement,
    UrlSourceElement,
)
from slack_sdk.models.messages.chunk import PlanUpdateChunk, TaskUpdateChunk

from agent.tools import get_gregorian_time, get_quintus_time
from handlers import messaging
from shared.types import ChatEvent

AVAILABLE_TOOLS: dict[str, Any] = {
    "get_gregorian_time": get_gregorian_time,
    "get_quintus_time": get_quintus_time,
}


def response_generate(
    client: WebClient,
    context: BoltContext,
    event: ChatEvent,
    logger: Logger,
    thinking: bool = True,
) -> None:
    authorization = context.authorize_result
    if authorization is None:
        return
    channel_id = event.get("channel")
    if channel_id is None:
        return
    message = event.get("text") and event.get("type")
    if message is None:
        return
    team_id = authorization.team_id
    thread_ts = messaging.get_event_thread_ts(event)
    user_id = authorization.user_id
    try:
        client.assistant_threads_setStatus(
            channel_id=channel_id,
            thread_ts=thread_ts,
            status="is up to something...",
            loading_messages=[
                "Enticing the curious...",
                "Planning toward mischief...",
                "Gathering apples...",
            ],
        )
        thread = messaging.get_message_thread(
            client=client,
            channel_id=channel_id,
            message_text=message,
            thread_ts=thread_ts,
            logger=logger,
        )
        model = os.getenv("OLLAMA_MODEL", "glm-4.7-flash")
        host = os.getenv("OLLAMA_CLIENT", "http://localhost:11434")
        ollama = Client(host=host)
        messages: list[Any] = thread.copy()

        response_streamer = client.chat_stream(
            channel=channel_id,
            recipient_team_id=team_id,
            recipient_user_id=user_id,
            thread_ts=thread_ts,
            task_display_mode="plan",
        )
        started_thinking = False
        done_thinking = False

        while True:
            thinking_content = ""
            response_content = ""
            tool_calls: list[Message.ToolCall] = []

            response = ollama.chat(
                model=model,
                messages=messages,
                tools=list(AVAILABLE_TOOLS.values()),
                think=thinking,
                stream=True,
            )

            for chunk in response:
                if chunk.message.thinking:
                    if started_thinking is False:
                        started_thinking = True
                        response_streamer.append(
                            chunks=[
                                PlanUpdateChunk(
                                    title="Consulting the oracle...",
                                ),
                                TaskUpdateChunk(
                                    id="thinking",
                                    title="Communing with the void...",
                                    status="in_progress",
                                ),
                            ],
                        )
                    thinking_content += chunk.message.thinking
                if chunk.message.content:
                    if thinking and done_thinking is False:
                        response_streamer.append(
                            chunks=[
                                PlanUpdateChunk(
                                    title="Consulted the oracle",
                                ),
                                TaskUpdateChunk(
                                    id="thinking",
                                    title="Communed with the void",
                                    status="complete",
                                    details=thinking_content,
                                ),
                            ]
                        )
                        done_thinking = True
                    response_content += chunk.message.content
                    response_streamer.append(markdown_text=chunk.message.content)
                if chunk.message.tool_calls:
                    for tool_call in chunk.message.tool_calls:
                        tool_calls.append(tool_call)
                        if tool_call.function.name == "get_gregorian_time":
                            response_streamer.append(
                                chunks=[
                                    TaskUpdateChunk(
                                        id="gregorian",
                                        title="Asking for the time...",
                                        status="in_progress",
                                    ),
                                ],
                            )
                        elif tool_call.function.name == "get_quintus_time":
                            response_streamer.append(
                                chunks=[
                                    TaskUpdateChunk(
                                        id="quintus",
                                        title="Questioning the calendars...",
                                        status="in_progress",
                                    ),
                                ],
                            )

            if thinking_content or response_content or tool_calls:
                messages.append(
                    {
                        "role": "assistant",
                        "thinking": thinking_content,
                        "content": response_content,
                        "tool_calls": tool_calls,
                    }
                )

            if not tool_calls:
                if not thinking:
                    response_streamer.stop()
                else:
                    response_streamer.stop(
                        blocks=[
                            ContextActionsBlock(
                                elements=[
                                    FeedbackButtonsElement(
                                        action_id="feedback",
                                        positive_button=FeedbackButtonObject(
                                            text="+1",
                                            accessibility_label="Share good vibes",
                                            value="positive",
                                        ),
                                        negative_button=FeedbackButtonObject(
                                            text="-1",
                                            accessibility_label="Cast evil spirit",
                                            value="negative",
                                        ),
                                    )
                                ]
                            )
                        ],
                    )
                break

            for call in tool_calls:
                if call.function.name == "get_gregorian_time":
                    result = get_gregorian_time(**call.function.arguments)
                elif call.function.name == "get_quintus_time":
                    result = get_quintus_time(**call.function.arguments)
                else:
                    result = "Unknown tool"
                messages.append(
                    {
                        "role": "tool",
                        "tool_name": call.function.name,
                        "content": result,
                    }
                )
                if call.function.name == "get_gregorian_time":
                    response_streamer.append(
                        chunks=[
                            TaskUpdateChunk(
                                id="gregorian",
                                title="Asked for the time",
                                status="complete",
                            ),
                        ],
                    )
                elif call.function.name == "get_quintus_time":
                    response_streamer.append(
                        chunks=[
                            TaskUpdateChunk(
                                id="quintus",
                                title="Questioned the calendars",
                                status="complete",
                                sources=[
                                    UrlSourceElement(
                                        text="Quintus Calendars",
                                        url="https://quintus.sh",
                                    ),
                                ],
                            ),
                        ],
                    )
    except Exception as e:
        logger.error("An error occurred during response generation", exc_info=e)
