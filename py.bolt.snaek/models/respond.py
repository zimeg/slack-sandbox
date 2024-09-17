import json
import os
import time
from logging import Logger

import requests
from slack_sdk import WebClient

from handlers import messaging
from shared.types import ChatEvent


def response_generate(
    client: WebClient,
    event: ChatEvent,
    logger: Logger,
) -> None:
    url = f'{os.getenv("OLLAMA_CLIENT", "http://localhost:11434")}/api/chat'
    thread = messaging.get_message_thread(
        client=client,
        event=event,
        logger=logger,
    )
    try:
        data = {
            "model": os.getenv("OLLAMA_MODEL", "mistral"),
            "messages": thread,
        }
        response = requests.post(url, data=json.dumps(data), stream=True)
        _response_generate_stream(client, event, response, logger)
    except requests.exceptions.HTTPError as e:
        logger.error("Unexpected HTTP error occured", exc_info=e)
    except requests.exceptions.Timeout as e:
        logger.error("Request timeout error occured", exc_info=e)
    except requests.exceptions.RequestException as e:
        logger.error("Failed to generate a response", exc_info=e)
    except Exception as e:
        logger.error("An unknown error has happened", exc_info=e)


def _now():
    return round(time.time() * 1000)


def _response_generate_stream(
    client: WebClient,
    event: ChatEvent,
    response: requests.models.Response,
    logger: Logger,
) -> None:
    channel_id = event["channel"]
    content = ""
    message_ts = None
    metadata = None
    thread_ts = messaging.get_event_thread_ts(event)
    try:
        last_update_ms = _now()
        for line in response.iter_lines():
            if not line:
                continue
            json_response = json.loads(s=line.decode("utf-8"))
            if json_response.get("error") is not None:
                raise RuntimeError(json_response.get("error"))
            message = json_response.get("message")
            content += message.get("content", "")
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
            elif _now() - last_update_ms < 1200:
                continue
            message_ts = messaging.put_message(
                client=client,
                channel_id=channel_id,
                message_ts=message_ts,
                thread_ts=thread_ts,
                content=content,
                logger=logger,
                metadata=metadata,
            )
            last_update_ms = _now()
            if json_response.get("done"):
                break
    except json.JSONDecodeError as e:
        logger.error("Failed to decode JSON", exc_info=e)
