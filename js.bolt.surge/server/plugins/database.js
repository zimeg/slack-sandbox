import { db } from "../lib/database/index.js";
import { logger } from "../lib/logger.js";

export default defineNitroPlugin(async () => {
  try {
    await db.load();
  } catch (error) {
    logger.error("Database initialization failed:", error);
    throw error;
  }
});
