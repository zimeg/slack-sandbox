resource "heroku_app" "surged" {
  name   = var.heroku_app_name
  region = "us"
  stack  = "heroku-22"

  buildpacks = [ "heroku/nodejs" ]

  sensitive_config_vars = {
     SLACK_APP_TOKEN = var.slack_app_token
     SLACK_BOT_TOKEN = var.slack_bot_token
   }
}

resource "heroku_build" "project" {
  app_id = heroku_app.surged.id

  source {
    path = "../src"
  }
}

resource "heroku_formation" "labor" {
  app_id     = heroku_app.surged.id
  type       = "worker"
  quantity   = 1
  size       = "eco"
  depends_on = [heroku_build.project]
}
