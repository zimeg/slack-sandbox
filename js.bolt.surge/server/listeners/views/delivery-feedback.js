import {
  convertEmailToMarkdown,
  extractEmailContent,
} from "../../lib/email/convert.js";
import { buildEmailHeader, decodeEntities } from "../../lib/email/format.js";

/**
 * @typedef {Object} DeliveryFeedbackViewOptions
 * @property {import("../../lib/database/index.js").Database} db
 * @property {Function} generate - Text generation function
 */

/**
 * Create a callback for delivery_feedback_modal view submissions.
 * @param {DeliveryFeedbackViewOptions} options
 * @returns {import("@slack/bolt").Middleware<import("@slack/bolt").SlackViewMiddlewareArgs>}
 */
export default function deliveryFeedbackViewCallback(options) {
  return async ({ ack, body, view, client, logger }) => {
    await ack();
    try {
      const { feedbackId, channelId, threadTs, fileId } = JSON.parse(
        view.private_metadata,
      );
      const details =
        view.state.values.feedback_details?.details?.value ?? null;
      const selectedOptions =
        view.state.values.feedback_options?.options?.selected_options ?? [];
      const resend = selectedOptions.some((opt) => opt.value === "resend");
      const consentToReview = selectedOptions.some(
        (opt) => opt.value === "consent_to_review",
      );
      if (feedbackId) {
        await options.db.updateFeedbackDetails(feedbackId, {
          details,
          resend,
          consentToReview,
        });
      }
      await client.chat.postEphemeral({
        channel: channelId,
        thread_ts: threadTs,
        user: body.user.id,
        text: ":sparkles:",
      });
      if (resend && fileId && details) {
        await resendDelivery({
          generate: options.generate,
          client,
          fileId,
          channelId,
          threadTs,
          notes: details,
          logger,
        });
      }
    } catch (error) {
      logger.error("Failed to save delivery feedback", error);
    }
  };
}

/**
 * Resend an email-to-markdown conversion with feedback notes.
 * @param {Object} params
 * @param {Function} params.generate - Text generation function
 * @param {any} params.client
 * @param {string} params.fileId
 * @param {string} params.channelId
 * @param {string} params.threadTs
 * @param {string} params.notes
 * @param {any} params.logger
 */
async function resendDelivery({
  generate,
  client,
  fileId,
  channelId,
  threadTs,
  notes,
  logger,
}) {
  const info = await client.files.info({ file: fileId });
  if (!info.ok || !info.file) {
    logger.warn("Could not get file info for resend", fileId);
    return;
  }
  const file = info.file;
  const emailContent = extractEmailContent(file);
  if (!emailContent) {
    logger.warn("Email file has no content for resend", fileId);
    return;
  }
  // Resends are free — no stamp deducted since the original conversion
  // consumed a stamp and this is a correction attempt.
  const result = await convertEmailToMarkdown({
    emailContent,
    generate,
    feedback: notes,
  });
  if (!result) {
    logger.warn("AI returned no content for resend", fileId);
    return;
  }
  const title = decodeEntities(file.title || file.name) || "(No Subject)";
  const header = buildEmailHeader(file);

  if (channelId && threadTs) {
    await client.filesUploadV2({
      channel_id: channelId,
      thread_ts: threadTs,
      content: result.content,
      filename: `${title}.md`,
      title: `:recycle: ${title}`,
      ...(header && {
        blocks: [
          {
            type: "section",
            text: { type: "mrkdwn", text: header },
          },
        ],
      }),
    });
  }
}
