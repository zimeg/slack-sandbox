# 🗄️ .devcontainer

A [development container][container] provides a predefined environment with
some tools needed for development, which can be useful in remote settings.

This specific container packages [the Slack CLI][cli] with a few languages and
runtimes.

## Languages and runtimes

This repository contains various projects spanning languages and runtimes, so
multiple languages and runtimes are included. A more focused project might only
need one language!

Updates to the `Dockerfile` can be made to change the included runtimes.

**Included runtimes**:

- [Deno][deno]
- [Java][java] 18
- [Node][node] 20
- [Python][python] 3

## Editor extensions

Modifications to an editor might be possibile with additions to the
`devcontainer.json` file:

```json
{
	"customizations": {
		"vscode": {
			"extensions": [
                "denoland.vscode-deno",
                "vscodevim.vim"
            ],
			"settings": { 
				"terminal.integrated.shell.linux": "/bin/bash"
			}
		}
	}
}
```

<!-- a collection of links -->
[cli]: https://api.slack.com/automation/cli
[container]: https://containers.dev/
[deno]: https://deno.com/
[java]: https://openjdk.org/
[node]: https://nodejs.org/
[python]: https://www.python.org/