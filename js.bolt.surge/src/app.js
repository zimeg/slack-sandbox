import bolt from "@slack/bolt";
import logger from "@slack/logger";
import Dotenv from "./config/dotenv.js";
import Options from "./config/options.js";
import Database from "./database/index.js";
import events from "./listeners/events/index.js";

const env = new Dotenv();
const db = new Database(env);
const options = new Options(env, db);
const app = new bolt.App(options.config);

events(app);

(async () => {
  const log = new logger.ConsoleLogger();
  try {
    await db.load();
    await app.start(env.vars.port ?? 3000);
    log.info(":zap: Bolt is now powering Surge");
  } catch (error) {
    log.error("Failed to start the app!", error);
  }
})();
