import { createHandler } from "@vercel/slack-bolt";
import { app, receiver } from "../../app.js";

// In production, receiver is a VercelReceiver (this endpoint is unused in Socket Mode)
const handler = createHandler(
  app,
  /** @type {import("@vercel/slack-bolt").VercelReceiver} */ (receiver),
);

let initialized = false;

/**
 * Handle incoming Slack events via HTTP POST.
 * @param {import("h3").H3Event} event
 */
export default defineEventHandler(async (event) => {
  if (!initialized) {
    await app.init();
    initialized = true;
  }
  const request = toWebRequest(event);
  return handler(request);
});
