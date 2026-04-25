import { receiver } from "../../app.js";

/**
 * Handle OAuth callback from Slack.
 * @param {import("h3").H3Event} event
 */
export default defineEventHandler(async (event) => {
  const request = toWebRequest(event);
  return /** @type {any} */ (receiver).handleCallback(request);
});
