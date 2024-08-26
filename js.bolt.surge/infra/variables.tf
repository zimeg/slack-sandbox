variable "database_url" {
  description = "Path to the postgresql storage"
  type        = string
  sensitive   = true
}

variable "heroku_api_key" {
  description = "Credentials to Heroku services"
  type        = string
  sensitive   = true
}

variable "heroku_app_name" {
  description = "Memorable reference of the project"
  type        = string
  default     = "surged"
}

variable "slack_client_id" {
  description = "Identifier of the connection"
  type        = string
  sensitive   = true
}

variable "slack_client_secret" {
  description = "Confirmation of identification"
  type        = string
  sensitive   = true
}

variable "slack_environment_tag" {
  description = "Meaning behind the manifest"
  type        = string
}

variable "slack_log_level" {
  description = "Output verbosities"
  type        = string
  default     = "info"
}

variable "slack_signing_secret" {
  description = "Incoming request signature"
  type        = string
  sensitive   = true
}

variable "slack_state_secret" {
  description = "Random settings of authentication"
  type        = string
  sensitive   = true
}
