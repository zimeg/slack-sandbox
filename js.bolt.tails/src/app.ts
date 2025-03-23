import { App, LogLevel } from "@slack/bolt";
import registerListeners from "./listeners";
import routes from "./routes";

const app = new App({
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  token: process.env.SLACK_BOT_TOKEN,
  customRoutes: routes,
  logLevel: LogLevel.DEBUG,
  installerOptions: {
    port: +(process.env.PORT || 3000), // https://github.com/slackapi/bolt-js/blob/7c2957ea2319c409a55f83e488d3b16a726ae338/src/receivers/SocketModeReceiver.ts#L159
  },
});

registerListeners(app);

(async () => {
  await app.start();
  console.log("⚡️ Bolt app is running!");
})();
