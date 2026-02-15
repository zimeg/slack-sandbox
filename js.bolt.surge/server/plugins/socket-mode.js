import { app } from "../app.js";

const isProduction = process.env.SLACK_ENVIRONMENT_TAG === "production";

export default defineNitroPlugin(async () => {
  if (isProduction) {
    return;
  }

  const appToken = process.env.SLACK_APP_TOKEN;
  console.log(`SLACK_APP_TOKEN: ${appToken?.slice(0, 12)}...`);

  await app.start();
  console.log("Bolt app started in Socket Mode");
});
