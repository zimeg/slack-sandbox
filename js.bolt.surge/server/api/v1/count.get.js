import { db } from "../../lib/database/index.js";

/**
 * Get current mail count with breakdown by source.
 */
export default defineEventHandler(async () => {
  try {
    const counts = await db.getMessageCountBySource();
    return { count: counts.total, web: counts.web, slack: counts.slack };
  } catch (error) {
    console.error("Failed to get count:", error);
    throw error;
  }
});
