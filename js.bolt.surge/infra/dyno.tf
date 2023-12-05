resource "heroku_app" "powerd" {
  name   = var.heroku_app_name
  region = "us"
  stack  = "heroku-22"

  buildpacks = [
    "heroku/nodejs"
  ]

  sensitive_config_vars = {
    SLACK_APP_TOKEN = var.slack_app_token
    SLACK_BOT_TOKEN = var.slack_bot_token
  }
}

resource "heroku_slug" "bundles" {
  app_id                         = heroku_app.powerd.id
  buildpack_provided_description = "Node/Bolt"
  file_path                      = "../surge.tar.gz"

  process_types = {
    worker = "node-v20.10.0-linux-x64/bin/node src/app.js"
  }
}

resource "heroku_app_release" "launch" {
  app_id  = heroku_app.powerd.id
  slug_id = heroku_slug.bundles.id
}

resource "heroku_formation" "dynob" {
  app_id     = heroku_app.powerd.id
  type       = "worker"
  quantity   = 1
  size       = "eco"
  depends_on = [heroku_app_release.launch]
}
