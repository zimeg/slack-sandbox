import {
  convertEmailToMarkdown,
  extractEmailContent,
} from "../../lib/email/convert.js";
import { buildEmailHeader, decodeEntities } from "../../lib/email/format.js";

/**
 * @typedef {Object} FileSharedOptions
 * @property {import("../../lib/database/index.js").Database} db
 * @property {Function} generate - Text generation function
 */

/**
 * Create a callback for file_shared events that processes emails.
 * @param {FileSharedOptions} options
 * @returns {import("@slack/bolt").Middleware<import("@slack/bolt").SlackEventMiddlewareArgs<'file_shared'>>}
 */
export default function fileSharedCallback(options) {
  return async ({ client, event, context, logger }) => {
    try {
      const info = await client.files.info({ file: event.file_id });
      if (!info.ok || !info.file) {
        logger.warn("Could not get file info", event.file_id);
        return;
      }
      const file = info.file;
      if (file.filetype !== "email") {
        return;
      }
      const emailContent = extractEmailContent(file);
      if (!emailContent) {
        logger.warn("Email file has no content", event.file_id);
        return;
      }

      const teamId = context.teamId;
      const enterpriseId = context.isEnterpriseInstall
        ? context.enterpriseId
        : undefined;

      const balance = await options.db.getBalance({ teamId, enterpriseId });
      if (balance <= 0) {
        logger.info("No stamps available", { teamId, enterpriseId });
        if (event.channel_id) {
          await client.chat.postMessage({
            channel: event.channel_id,
            thread_ts: info.file.shares?.public?.[event.channel_id]?.[0]?.ts,
            text: "No stamps remaining! Visit the App Home to order more stamps.",
          });
        }
        return;
      }

      const result = await convertEmailToMarkdown({
        emailContent,
        generate: options.generate,
      });
      if (!result) {
        logger.warn("AI returned no content for email", event.file_id);
        return;
      }

      const header = buildEmailHeader(file);

      await options.db.deductStamp({
        teamId,
        enterpriseId,
        userId: file.user,
        model: result.model,
        inputTokens: result.usage?.inputTokens ?? 0,
        outputTokens: result.usage?.outputTokens ?? 0,
        totalTokens: result.usage?.totalTokens ?? 0,
        referenceId: event.file_id,
      });

      const title = decodeEntities(file.title || file.name) || "(No Subject)";
      const shares = info.file.shares;
      const threadTs =
        shares?.public?.[event.channel_id]?.[0]?.ts ??
        shares?.private?.[event.channel_id]?.[0]?.ts;

      if (event.channel_id && threadTs) {
        await client.filesUploadV2({
          channel_id: event.channel_id,
          thread_ts: threadTs,
          content: result.content,
          filename: `${title}.md`,
          title: `:email: ${title}`,
          blocks: [
            {
              type: "section",
              text: { type: "mrkdwn", text: header },
            },
            {
              type: "context_actions",
              elements: [
                {
                  type: "feedback_buttons",
                  action_id: "email_delivery_feedback",
                  positive_button: {
                    text: { type: "plain_text", text: "+1" },
                    value: event.file_id,
                  },
                  negative_button: {
                    text: { type: "plain_text", text: "-1" },
                    value: event.file_id,
                  },
                },
              ],
            },
          ],
        });
        await options.db.incrementMessageCount("slack");
      }

      logger.info("Processed email to markdown", event.file_id);
    } catch (error) {
      logger.error("Error processing file_shared event:", error);
    }
  };
}
