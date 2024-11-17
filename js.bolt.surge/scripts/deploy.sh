#!/usr/bin/env bash

function error() {
    printf "\x1b[31mERROR\x1b[0m %s\n" "$1" >&2
}

function warn() {
    printf "\x1b[37mWARN\x1b[0m %s\n" "$1" >&2
}

function info() {
    printf "INFO %s\n" "$1"
}

function debug() {
    printf "\x1b[2mDEBUG\x1b[0m %s\n" "$1"
}

if ! source .env.production >&2; then
    debug "Attempting to source variables from .env.production"
fi

if [ "$SLACK_ENVIRONMENT_TAG" != "production" ]; then
    error "Failed to gather production environment variables"
    info "Missing SLACK_ENVIRONMENT_TAG=\"production\""
    warn "It is possible the app manifest was updated regardless"

    exit 1
fi

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
