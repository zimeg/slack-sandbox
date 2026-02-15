import appHomeOpenedCallback from "./app-home-opened.js";
import fileSharedCallback from "./file-shared.js";

/**
 * @typedef {Object} ListenerOptions
 * @property {import("../../lib/database/index.js").Database} db
 */

/**
 * Register all event listeners on the Bolt app.
 * @param {import("@slack/bolt").App} app
 * @param {ListenerOptions} options
 */
export function registerListeners(app, options) {
  app.event("app_home_opened", appHomeOpenedCallback(options));
  app.event("file_shared", fileSharedCallback(options));
}
