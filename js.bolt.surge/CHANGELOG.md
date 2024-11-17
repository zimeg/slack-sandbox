# Changelog

Most notable changes to this project will be documented in this file.

Updates follow a [conventional commit][commits] style and the project is
versioned with [calendar versioning][calver].

## Changes

- style: remove remaining renaming of past infrastructure 2024-08-31
- build: init tofu infra before deploying and not install 2024-08-31
- docs: paste production links for placeholder path pages 2024-08-31
- chore: update stack to latest dependencies with node 22 2024-08-31
- feat: store installations while manifesting applications 2024-08-25
- build: enforce passing lints and checked types as tests 2024-08-07
- style: lint and format files not found in the gitignore 2024-06-23
- refactor: convert commonjs imports to esmodule imports 2024-06-22
- build: reload after changes for restarting socket mode 2024-06-22
- chore: replace eslint lintings with the biome lintings 2024-06-22
- feat: package a production app with an icon and install 2024-06-22
- build: unbundle node runtimes from packaged deployments 2024-06-22
- docs: update remote branch for cloning this sample app 2024-02-24
- feat: collect app environment tokens from the slack cli 2024-02-17
- chore: set slack package versions for custom functions 2024-02-11
- fix: initialize the infrastructure during preinstalls 2023-12-06
- feat: prepare the deploy hook with a production script 2023-12-05
- feat: introduce this app for a hurried deploy to heroku 2023-12-05

[calver]: https://calver.org
[commits]: https://www.conventionalcommits.org/en/v1.0.0/
