variable "heroku_api_key" {
  description = "Credentials to Heroku services"
  type        = string
  sensitive   = true
}

variable "heroku_app_name" {
  description = "Memorable reference of the project"
  type        = string
  default     = "surges"
}

variable "slack_app_token" {
  description = "Connection token for websockets"
  type        = string
  sensitive   = true
}

variable "slack_bot_token" {
  description = "Authorization token of the bot user"
  type        = string
  sensitive   = true
}
