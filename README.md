# 🏖️ Slack sandbox

A repo for experimenting with and testing various APIs across various samples.

## 🐌 Experimental apps and such

At the moment, this is repo contains a few apps and scripts in different
languages on various frameworks or libraries or sdks or whatever else.

* [Slack Send Github Action][gh_action]: `.github/workflows`
* [Deno Slack SDK][sdk_deno]: `deno.sdk.begut`
* [Java Slack SDK][sdk_java]: `java.sdk.gibra`
* [Bolt for JavaScript][bolt_js]: `js.bolt.tails`
* [Bolt for Python][bolt_python]: `py.bolt.snaek`
* [Python Slack SDK][sdk_python]: `py.sdk.sdkai`

Each subdirectory will have more information on getting started and references
to related documentation. Be warned that the apps might not make much sense.

## 🔧 Local libraries and tooling

For convenient tinkering, some of the apps above rely on local copies of their
Slack dependencies. These are searched for in a supposed `../tools` directory.

Related repos can be cloned into the `../tools` directory to create a file
structure like so (with this repo being called `sandbox`):

```
 | sandbox/
 | - py.bolt.snaek/
 | - py.sdk.sdkai/
 | tools/
 | - bolt-python/
 | - python-slack-sdk/
```

<!-- a collection of links -->
[bolt_js]: https://github.com/slackapi/bolt-js
[bolt_python]: https://github.com/slackapi/bolt-python
[gh_action]: https://github.com/slackapi/slack-github-action
[sdk_deno]: https://github.com/slackapi/deno-slack-sdk
[sdk_java]: https://github.com/slackapi/java-slack-sdk
[sdk_python]: https://github.com/slackapi/python-slack-sdk
