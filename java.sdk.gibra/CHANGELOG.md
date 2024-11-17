# Changelog

Most notable changes to this project will be documented in this file.

Updates follow a [conventional commit][commits] style and the project is
versioned with [calendar versioning][calver].

## Changes

- build: downgrade the gradle version to match the java version 2024-11-17
- build: set java language toolchain to a matching major version 2024-11-17
- fix: include the method flag option for parsing value of flags 2024-11-16
- fix: avoid duplicate socket connection with the sdk connection 2024-09-01
- build: include implementations of a javax websocket connection 2024-09-01
- build: remove dotenv setups when entering the application anew 2024-09-01
- ci: consider the application set for sharing in the downstream 2024-08-31
- build: perform scripted action and start apps using slack cli 2024-08-31
- build: start a bolt socket mode application or request an api 2024-08-31
- build: downgrade java version to match flaked gralde defaults 2024-07-18
- build: adjust gradle and java dependencies with a flaked setup 2024-07-18

[calver]: https://calver.org
[commits]: https://www.conventionalcommits.org/en/v1.0.0/
