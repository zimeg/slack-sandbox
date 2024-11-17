# 🗄️ infra

Some configurations and other information on the servers that run production.

## Preparing the providers

Hosting is handled by Heroku and runs with a [Heroku dyno][dyno]. An account is
needed to host here so please [create an account][heroku] if needed.

Gather a Heroku API key from the CLI with `heroku authorizations:create` and
save it to the `.env` file.

AWS credentials might be necessary if you [share the state](#sharing-the-state).

After this setup is complete try creating new infrastructure that runs your app
with the [OpenTofu CLI][tofu]:

```sh
# Prepare project dependencies
$ npm install

# Push to production
$ slack deploy
```

## Configuring environment variables

Deployments with the Slack CLI automatically provide the required environment
variables to start an app.

Other deployment strategies require a `SLACK_APP_TOKEN` and `SLACK_BOT_TOKEN` in
the `.env` file.

### Adding more variables

Additional environment variables can be included in deployments by adding these
variables to a file in this directory called `tofu.auto.tfvars.json`:

```json
{
  "numerics": "12",
  "password": "super-secret-value"
}
```

Then updating the `dyno.tf` file as follows to access the variable in your app
as `process.env.numerics`:

```hcl
resource "heroku_app" "powerd" {
  # ...
  sensitive_config_vars = {
    SLACK_APP_TOKEN = var.slack_app_token
    SLACK_BOT_TOKEN = var.slack_bot_token
    NUMERICS = var.numerics
    PASSWORD = var.password
  }
}
```

## Sharing the state

Existing objects of infrastructure are remembered using a backend configuration.
This is optional but useful as it synchronizes changes across multiple machines.

Instructions for setup are [detailed here][state] or the `backend` section can
be removed from `main.tf`.

[dyno]: https://devcenter.heroku.com/articles/dyno-types
[heroku]: https://dashboard.heroku.com/apps
[state]: https://developer.hashicorp.com/terraform/language/settings/backends/configuration
[tofu]: https://opentofu.org
