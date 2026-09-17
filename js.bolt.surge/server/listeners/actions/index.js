import {
  deliveryFeedbackCallback,
  deliveryFeedbackDetailsCallback,
} from "./delivery-feedback.js";

/**
 * @typedef {Object} ActionOptions
 * @property {import("../../lib/database/index.js").Database} db
 */

/**
 * Register all action listeners on the Bolt app.
 * @param {import("@slack/bolt").App} app
 * @param {ActionOptions} options
 */
export function registerActions(app, options) {
  app.action("email_delivery_feedback", deliveryFeedbackCallback(options));
  app.action("delivery_feedback_details", deliveryFeedbackDetailsCallback());
}
