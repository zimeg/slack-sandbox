# 📒 Manifest

The app manifest makes the essence of an app. Different settings require certain
configurations and these are contained within.

## Calling the `get-manifest` hook

The tagged extension of a manifest - `manifest.*.json` will write over defaults
found in the `manifest.json`:

```sh
$ SLACK_ENVIRONMENT_TAG="development" slack manifest
$ SLACK_ENVIRONMENT_TAG="production" slack manifest
```
