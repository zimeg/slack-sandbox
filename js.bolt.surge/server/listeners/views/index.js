import deliveryFeedbackViewCallback from "./delivery-feedback.js";

/**
 * @typedef {Object} ViewOptions
 * @property {import("../../lib/database/index.js").Database} db
 * @property {Function} generate - Text generation function
 */

/**
 * Register all view listeners on the Bolt app.
 * @param {import("@slack/bolt").App} app
 * @param {ViewOptions} options
 */
export function registerViews(app, options) {
  app.view("delivery_feedback_modal", deliveryFeedbackViewCallback(options));
}
