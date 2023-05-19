import * as dotenv from "dotenv";
dotenv.config();

import { App, LogLevel } from "@slack/bolt";
import routes from "./routes";
import registerListeners from './listeners';

/*
* Socket mode: Use `appToken` and `socketMode=true`
* HTTP mode: Use `signingSecret` and setup URLs
*/

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    // signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    logLevel: LogLevel.DEBUG,

    customRoutes: routes,
});

registerListeners(app);

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log("⚡️ Bolt app is running!");
})();
