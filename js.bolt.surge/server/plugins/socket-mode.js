import { app } from "../app.js";
import { logger } from "../lib/logger.js";

export default defineNitroPlugin(async () => {
  if (process.env.VERCEL_ENV) {
    return;
  }

  const appToken = process.env.SLACK_APP_TOKEN;
  logger.info(`SLACK_APP_TOKEN: ${appToken?.slice(0, 12)}...`);

  await app.start();
  logger.info("Bolt app started in Socket Mode");
});
