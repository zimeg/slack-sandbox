import appHomeOpenedCallback from "./app_home_opened/index.js";

/**
 * @param {import("@slack/bolt").App} app - The configured Slack app.
 */
export default function register(app) {
  app.event("app_home_opened", appHomeOpenedCallback);
}
