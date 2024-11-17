resource "heroku_app" "surged" {
  name   = var.heroku_app_name
  region = "us"
  stack  = "heroku-24"
  acm = "true"

  buildpacks = [ "heroku/nodejs" ]

  sensitive_config_vars = {
     DATABASE_URL = var.database_url
     SLACK_CLIENT_ID = var.slack_client_id
     SLACK_CLIENT_SECRET = var.slack_client_secret
     SLACK_ENVIRONMENT_TAG = var.slack_environment_tag
     SLACK_LOG_LEVEL = var.slack_log_level
     SLACK_SIGNING_SECRET = var.slack_signing_secret
     SLACK_STATE_SECRET = var.slack_state_secret
   }
}

resource "heroku_addon" "database" {
  app_id = heroku_app.surged.id
  plan   = "heroku-postgresql:essential-0"
}

resource "heroku_build" "project" {
  app_id = heroku_app.surged.id

  source {
    path = "../src"
  }
}

resource "heroku_domain" "surgemail" {
  app_id   = heroku_app.surged.id
  hostname = "surgem.ai"
}

resource "heroku_formation" "inbox" {
  app_id     = heroku_app.surged.id
  type       = "web"
  quantity   = 1
  size       = "eco"
  depends_on = [heroku_build.project]
}
