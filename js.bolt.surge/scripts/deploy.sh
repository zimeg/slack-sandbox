#!/usr/bin/env bash

export TF_VAR_database_url="$DATABASE_URL"
export TF_VAR_heroku_api_key="$HEROKU_API_KEY"
export TF_VAR_slack_client_id="$SLACK_CLIENT_ID"
export TF_VAR_slack_client_secret="$SLACK_CLIENT_SECRET"
export TF_VAR_slack_environment_tag="$SLACK_ENVIRONMENT_TAG"
export TF_VAR_slack_log_level="$SLACK_LOG_LEVEL"
export TF_VAR_slack_signing_secret="$SLACK_SIGNING_SECRET"
export TF_VAR_slack_state_secret="$SLACK_STATE_SECRET"

tofu -chdir=infra init
tofu -chdir=infra apply -auto-approve
