/**
 * @typedef {Object} DeliveryFeedbackOptions
 * @property {import("../../lib/database/index.js").Database} db
 */

/**
 * Create a callback for email_delivery_feedback actions.
 * @param {DeliveryFeedbackOptions} options
 * @returns {import("@slack/bolt").Middleware<import("@slack/bolt").SlackActionMiddlewareArgs<import("@slack/bolt").BlockButtonAction>>}
 */
export function deliveryFeedbackCallback(options) {
  return async ({ ack, client, body, action, context, logger }) => {
    await ack();
    try {
      const rating = action.text?.text ?? "";
      const fileId = action.value ?? "";
      const channelId = body.channel?.id;
      const threadTs = body.message?.ts;
      const teamId = context.teamId;
      const enterpriseId = context.isEnterpriseInstall
        ? context.enterpriseId
        : undefined;
      const feedbackId = await options.db.saveFeedback({
        teamId,
        enterpriseId,
        userId: body.user.id,
        fileId,
        rating,
      });
      if (!channelId) {
        return;
      }
      await client.chat.postEphemeral({
        channel: channelId,
        thread_ts: threadTs,
        user: body.user.id,
        text: ":love_letter: Thanks for sharing kind feedback!",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: ":love_letter: Thanks for sharing kind feedback!",
            },
            accessory: {
              type: "button",
              text: {
                type: "plain_text",
                text: "More thoughts",
              },
              action_id: "delivery_feedback_details",
              value: JSON.stringify({
                feedbackId,
                rating,
                channelId,
                threadTs,
                fileId,
                teamId,
                enterpriseId,
              }),
            },
          },
        ],
      });
    } catch (error) {
      logger.error("Failed to save delivery feedback", error);
    }
  };
}

/**
 * Build the positive feedback modal view.
 * @param {string} privateMetadata
 * @returns {import("@slack/bolt").View}
 */
function positiveModal(privateMetadata) {
  return {
    type: "modal",
    callback_id: "delivery_feedback_modal",
    private_metadata: privateMetadata,
    title: {
      type: "plain_text",
      text: "Feedback",
    },
    submit: {
      type: "plain_text",
      text: "Submit",
    },
    close: {
      type: "plain_text",
      text: "Cancel",
    },
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "We're so glad this went well! If there's something specific that stood out, we'd love to hear about it.",
        },
      },
      {
        type: "input",
        block_id: "feedback_details",
        optional: true,
        element: {
          type: "plain_text_input",
          action_id: "details",
          multiline: true,
          placeholder: {
            type: "plain_text",
            text: "What did you like about this delivery?",
          },
        },
        label: {
          type: "plain_text",
          text: "Tell us more",
        },
      },
    ],
  };
}

/**
 * Build the negative feedback modal view.
 * @param {string} privateMetadata
 * @returns {import("@slack/bolt").View}
 */
function negativeModal(privateMetadata) {
  return {
    type: "modal",
    callback_id: "delivery_feedback_modal",
    private_metadata: privateMetadata,
    title: {
      type: "plain_text",
      text: "Feedback",
    },
    submit: {
      type: "plain_text",
      text: "Submit",
    },
    close: {
      type: "plain_text",
      text: "Cancel",
    },
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "We're sorry this one missed the mark. Share what went wrong and we can take another pass at it.",
        },
      },
      {
        type: "input",
        block_id: "feedback_details",
        optional: true,
        element: {
          type: "plain_text_input",
          action_id: "details",
          multiline: true,
          placeholder: {
            type: "plain_text",
            text: "What could be improved about this delivery?",
          },
        },
        label: {
          type: "plain_text",
          text: "What happened",
        },
      },
      {
        type: "input",
        block_id: "feedback_options",
        optional: true,
        element: {
          type: "checkboxes",
          action_id: "options",
          initial_options: [
            {
              text: {
                type: "mrkdwn",
                text: "*Reattempt* the delivery with these notes and free postage",
              },
              value: "resend",
            },
          ],
          options: [
            {
              text: {
                type: "mrkdwn",
                text: "*Reattempt* the delivery with these notes and free postage",
              },
              value: "resend",
            },
            {
              text: {
                type: "mrkdwn",
                text: "Share this email and delivered message to improve future deliveries",
              },
              value: "consent_to_review",
            },
          ],
        },
        label: {
          type: "plain_text",
          text: "More options",
        },
      },
    ],
  };
}

/**
 * Create a callback for the "More thoughts" button.
 * @returns {import("@slack/bolt").Middleware<import("@slack/bolt").SlackActionMiddlewareArgs<import("@slack/bolt").BlockButtonAction>>}
 */
export function deliveryFeedbackDetailsCallback() {
  return async ({ ack, client, body, action, logger }) => {
    await ack();
    if (!action.value) {
      return;
    }
    try {
      const {
        feedbackId,
        rating,
        channelId,
        threadTs,
        fileId,
        teamId,
        enterpriseId,
      } = JSON.parse(action.value);
      const metadata = JSON.stringify({
        feedbackId,
        channelId,
        threadTs,
        fileId,
        teamId,
        enterpriseId,
      });
      const view =
        rating === "+1" ? positiveModal(metadata) : negativeModal(metadata);
      await client.views.open({
        trigger_id: body.trigger_id,
        view,
      });
    } catch (error) {
      logger.error("Failed to open feedback details modal", error);
    }
  };
}
