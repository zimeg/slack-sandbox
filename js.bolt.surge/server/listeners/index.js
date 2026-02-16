import { registerActions } from "./actions/index.js";
import { registerEvents } from "./events/index.js";

/**
 * @typedef {Object} ListenerOptions
 * @property {import("../lib/database/index.js").Database} db
 */

/**
 * Register all listeners on the Bolt app.
 * @param {import("@slack/bolt").App} app
 * @param {ListenerOptions} options
 */
export function registerListeners(app, options) {
  registerActions(app, options);
  registerEvents(app, options);
}
