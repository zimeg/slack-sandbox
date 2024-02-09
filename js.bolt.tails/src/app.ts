import { App, LogLevel } from "@slack/bolt";
import routes from "./routes";
import registerListeners from './listeners';

const app = new App({
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
    token: process.env.SLACK_BOT_TOKEN,
    customRoutes: routes,
    logLevel: LogLevel.DEBUG,
});

registerListeners(app);

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log("⚡️ Bolt app is running!");
})();
