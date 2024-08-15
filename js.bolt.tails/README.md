# 🪁 Tails

> Grounding energies from the cloud

This app aims to save copies of videos for archival hint or later listenings
using [Bolt for Javascript][bolt] and [`typescript`][typescript] with a program
that downloads both audio and visuals called [`yt-dlp`][ytdlp].

## Starting the show

Download [the Slack CLI][cli] for quick installations then follow these steps:

```sh
$ slack create tails --template zimeg/slacks --branch js.bolt.tails
$ cd tails
$ slack run     # Start a development server
```

> :warning: Some of the code won't make sense. It's a bit of a WIP.

## Saving videos

Posting a link to a YouTube video will cache the video as a file:

```slack
https://www.youtube.com/watch?v=jNQXAC9IVRw
```

```sh
$ ls cache
jNQXAC9IVRw.webm
```

Playback might require an internet browser despite the file being saved to disk.

## Discovering documentation

Fast reference can be found from the following paths:

- Downloader: https://github.com/yt-dlp/yt-dlp
- Bolt JS: https://slack.dev/bolt-js
- Slack API: https://api.slack.com/docs/apps

[apps]: https://api.slack.com/apps
[bolt]: https://github.com/slackapi/bolt-js
[cli]: https://api.slack.com/automation/cli
[typescript]: https://www.typescriptlang.org
[ytdlp]: https://github.com/yt-dlp/yt-dlp
