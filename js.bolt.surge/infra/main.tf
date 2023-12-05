terraform {
  required_providers {
    # https://registry.terraform.io/providers/heroku/heroku/latest/docs
    heroku = {
      source  = "heroku/heroku"
      version = "~> 5.2"
    }
  }
  backend "s3" {
    bucket         = "architectf"
    key            = "surges"
    region         = "us-east-1"
    dynamodb_table = "architectf-timeline"
  }
  required_version = "~> 1.1"
}

provider "heroku" {
  api_key = var.heroku_api_key
}
