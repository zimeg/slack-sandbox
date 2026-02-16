import { app } from "../app.js";

export default defineNitroPlugin(async () => {
  if (process.env.VERCEL_ENV) {
    return;
  }

  const appToken = process.env.SLACK_APP_TOKEN;
  console.log(`SLACK_APP_TOKEN: ${appToken?.slice(0, 12)}...`);

  await app.start();
  console.log("Bolt app started in Socket Mode");
});
