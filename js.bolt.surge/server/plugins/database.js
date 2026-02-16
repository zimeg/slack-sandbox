import { db } from "../lib/database/index.js";

export default defineNitroPlugin(async () => {
  try {
    await db.load();
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
});
