import { createHandler } from "@vercel/slack-bolt";
import { app, receiver } from "../../app.js";

console.log("[events.post.js] module loaded, app initialized:", Boolean(app));

// In production, receiver is a VercelReceiver (this endpoint is unused in Socket Mode)
const handler = createHandler(
  app,
  /** @type {import("@vercel/slack-bolt").VercelReceiver} */ (receiver),
);

/**
 * Handle incoming Slack events via HTTP POST.
 * @param {import("h3").H3Event} event
 */
export default defineEventHandler(async (event) => {
  const request = toWebRequest(event);
  console.log("[events] incoming request", {
    method: request.method,
    url: request.url,
    hasSignature: Boolean(request.headers.get("x-slack-signature")),
    hasTimestamp: Boolean(request.headers.get("x-slack-request-timestamp")),
  });
  const response = await handler(request);
  console.log("[events] response status", response.status);
  return response;
});
