import { db } from "../lib/database/index.js";

export default defineNitroPlugin(async () => {
  await db.load();
});
