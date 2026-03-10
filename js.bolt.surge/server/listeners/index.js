import { registerActions } from "./actions/index.js";
import { registerEvents } from "./events/index.js";
import { registerViews } from "./views/index.js";

/**
 * @typedef {Object} ListenerOptions
 * @property {import("../lib/database/index.js").Database} db
 * @property {Function} generate - Text generation function
 */

/**
 * Register all listeners on the Bolt app.
 * @param {import("@slack/bolt").App} app
 * @param {ListenerOptions} options
 */
export function registerListeners(app, options) {
  registerActions(app, options);
  registerEvents(app, options);
  registerViews(app, options);
}
