# Maintainers guide

Tinkering with typings is a dangerous game. Take this words and careful caution.

## Setting the SDK versions

This app uses the `@slack/bolt` package to power app functionalities and the
`@slack/cli-hooks` package to make development easier.

Either package version can be updated in the `package.json` to reference a local
copy:

```sh
$ npm install ../../tools/bolt-js
$ npm install ../../tools/node-slack-sdk/packages/cli-hooks --save-dev
```

After making changes to a local copy, a rebuild of the package and app might be
needed. Sometimes a fresh start helps too:

```sh
$ npm run install:force
```
