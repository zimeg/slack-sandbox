import json
import os
from logging import Logger

import requests
from slack_bolt import BoltContext
from slack_sdk import WebClient

from handlers import messaging
from shared.types import ChatEvent


def response_generate(
    client: WebClient,
    context: BoltContext,
    event: ChatEvent,
    logger: Logger,
) -> None:
    authorization = context.authorize_result
    if authorization is None:
        return
    channel_id = event.get("channel")
    if channel_id is None:
        return
    message = event.get("text")
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
        url = f"{os.getenv('OLLAMA_CLIENT', 'http://localhost:11434')}/api/chat"
        data = {
            "model": os.getenv("OLLAMA_MODEL", "gemma3"),
            "messages": thread,
            "stream": True,
        }
        response = requests.post(url, data=json.dumps(data))
        streamer = client.chat_stream(
            channel=channel_id,
            recipient_team_id=team_id,
            recipient_user_id=user_id,
            thread_ts=thread_ts,
        )
        for line in response.iter_lines():
            if not line:
                continue
            json_response = json.loads(s=line.decode("utf-8"))
            if json_response.get("error") is not None:
                raise RuntimeError(json_response.get("error"))
            content = json_response.get("message").get("content", "")
            streamer.append(
                markdown_text=content,
            )
            if json_response.get("done"):
                metadata = {
                    "event_type": "response_generated",
                    "event_payload": {
                        "total_duration": json_response.get("total_duration"),
                        "load_duration": json_response.get("load_duration"),
                        "prompt_eval_count": json_response.get("prompt_eval_count"),
                        "prompt_eval_duration": json_response.get(
                            "prompt_eval_duration"
                        ),
                        "eval_count": json_response.get("eval_count"),
                        "eval_duration": json_response.get("eval_duration"),
                    },
                }
                streamer.stop(
                    metadata=metadata,
                )
    except json.JSONDecodeError as e:
        logger.error("Failed to decode JSON", exc_info=e)
    except requests.exceptions.HTTPError as e:
        logger.error("Unexpected HTTP error occured", exc_info=e)
    except requests.exceptions.Timeout as e:
        logger.error("Request timeout error occured", exc_info=e)
    except requests.exceptions.RequestException as e:
        logger.error("Failed to generate a response", exc_info=e)
    except Exception as e:
        logger.error("An unknown error has happened", exc_info=e)
