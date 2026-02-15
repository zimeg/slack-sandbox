import { db } from "../../lib/database/index.js";

/**
 * Increment mail count.
 * @param {import("h3").H3Event} event
 */
export default defineEventHandler(async () => {
  try {
    const count = await db.incrementMessageCount();
    return { count };
  } catch (error) {
    console.error("Failed to increment count:", error);
    throw error;
  }
});
