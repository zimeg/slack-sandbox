# https://github.com/slackapi/python-slack-sdk#uploading-files-to-slack
# scopes: chat:write, files:write, files:read

import os
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from dotenv import load_dotenv
load_dotenv()

client = WebClient(token=os.environ['SLACK_BOT_TOKEN'])

try:
    filepath = "./tmp.txt"
    response = client.files_upload_v2(channel='C04CRUE6MU3', file=filepath)
    assert response["file"]  # the uploaded file
except SlackApiError as e:
    # You will get a SlackApiError if "ok" is False
    assert e.response["ok"] is False
    assert e.response["error"]  # str like 'invalid_auth', 'channel_not_found'
    print(f"Got an error: {e.response['error']}")
