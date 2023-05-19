# https://github.com/slackapi/python-slack-sdk/issues/1369
# scopes: chat:write

import os
from dotenv import load_dotenv

from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from slack_sdk.models.blocks import ImageBlock

load_dotenv()

client = WebClient(token=os.environ['SLACK_BOT_TOKEN'])

try:
    img = ImageBlock(image_url="https://i.pinimg.com/originals/4a/31/63/4a31635b0653dac546d069447cf12261.jpg", alt_text="a pokey and pixelated cactus", title="Cactus art")
    print(img.title)
    response = client.chat_postMessage(channel='#slack-sandbox-noisy', text="Cactus", blocks=[img])

    assert response["message"]["text"] == "Cactus"
except SlackApiError as e:
    # You will get a SlackApiError if "ok" is False
    assert e.response["ok"] is False
    assert e.response["error"]  # str like 'invalid_auth', 'channel_not_found'
    print(f"Got an error: {e.response['error']}")
