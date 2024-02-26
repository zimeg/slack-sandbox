import json
from logging import Logger
import os

import requests
from slack_sdk import WebClient

from handlers import messaging


def response_generate(client: WebClient, event, logger: Logger):
    url = f'{os.getenv("OLLAMA_CLIENT", "http://localhost:11434")}/api/chat'
    try:
        data = {
            "model": os.getenv("OLLAMA_MODEL", "mistral"),
            "messages": [
                {
                    "role": "user",
                    "content": event['text'],
                },
            ]
        }
        response = requests.post(url, data=json.dumps(data), stream=True)
        _response_generate_stream(client, event, response, logger)
    except requests.exceptions.HTTPError as e:
        logger.error("Unexpected HTTP error occured", exc_info=e)
    except requests.exceptions.RequestException as e:
        logger.error("Failed to generate a response", exc_info=e)
    except requests.exceptions.Timeout as e:
        logger.error("Request timeout error occured", exc_info=e)
    except Exception as e:
        logger.error("An unknown error has happened", exc_info=e)


def _response_generate_stream(
    client: WebClient,
    event,
    response: requests.models.Response,
    logger: Logger,
):
    channel_id = event['channel']
    content = ""
    message_ts = None
    metadata = None
    thread_ts = messaging.get_event_thread_ts(event)
    try:
        for line in response.iter_lines():
            if not line:
                continue
            json_response = json.loads(s=line.decode('utf-8'))
            content += json_response['message']['content']
            if json_response['done']:
                metadata = {
                    "event_type": "response_generated",
                    "event_payload": {
                        "total_duration": json_response['total_duration'],
                        "load_duration": json_response['load_duration'],
                        "prompt_eval_count":
                            json_response['prompt_eval_count'],
                        "prompt_eval_duration":
                            json_response['prompt_eval_duration'],
                        "eval_count": json_response['eval_count'],
                        "eval_duration": json_response['eval_duration'],
                    }
                }
            message_ts = messaging.put_message(
                client=client,
                channel_id=channel_id,
                message_ts=message_ts,
                thread_ts=thread_ts,
                content=content,
                logger=logger,
                metadata=metadata
            )
            if json_response['done']:
                break
    except json.JSONDecodeError as e:
        logger.error("Failed to decode JSON", exc_info=e)
