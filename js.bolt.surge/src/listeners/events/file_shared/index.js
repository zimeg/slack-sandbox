import Options from "../../../config/options.js";

/**
 * Create a callback for file_shared events that processes emails.
 * @param {Options} options - The configured options with OpenAI client.
 * @returns {import("@slack/bolt").Middleware<import("@slack/bolt").SlackEventMiddlewareArgs<'file_shared'>>} callback
 */
export default function fileSharedCallback(options) {
  return async ({ client, event, logger, context }) => {
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
      if (!file.preview) {
        logger.warn("Email file has no preview content", event.file_id);
        return;
      }
      const teamId = context.teamId;
      const enterpriseId = context.isEnterpriseInstall
        ? context.enterpriseId
        : undefined;
      const balance = await options.db.getBalance({ teamId, enterpriseId });
      if (balance <= 0) {
        logger.info("No credits available", { teamId, enterpriseId });
        if (event.channel_id) {
          await client.chat.postMessage({
            channel: event.channel_id,
            thread_ts: info.file.shares?.public?.[event.channel_id]?.[0]?.ts,
            text: "Failed to convert email - no credits remain. Order more at https://surgem.ai/",
          });
        }
        return;
      }
      const model = "gpt-4o-mini";
      const response = await options.agent.provider.responses.create({
        model,
        instructions:
          "Convert the following email content into clean, readable markdown. Preserve the structure (headers, lists, links) but remove any unnecessary formatting or noise. Keep the subject, sender, and date if present.",
        input: file.preview,
      });
      const markdown = response.output_text;
      if (!markdown) {
        logger.warn("OpenAI returned no content for email", event.file_id);
        return;
      }
      const usage = response.usage;
      await options.db.deductCredit({
        teamId,
        enterpriseId,
        model,
        inputTokens: usage?.input_tokens ?? 0,
        outputTokens: usage?.output_tokens ?? 0,
        totalTokens: usage?.total_tokens ?? 0,
        referenceId: event.file_id,
      });
      const title = `${event.file_id}: ${file.title || file.name || "(No Subject)"}`;
      const canvas = await client.canvases.create({
        title,
        document_content: {
          type: "markdown",
          markdown,
        },
      });
      if (!canvas.ok || !canvas.canvas_id) {
        logger.error("Failed to create canvas", canvas.error);
        return;
      }
      if (event.channel_id) {
        await client.canvases.access.set({
          canvas_id: canvas.canvas_id,
          access_level: "read",
          channel_ids: [event.channel_id],
        });
        await client.chat.postMessage({
          channel: event.channel_id,
          thread_ts: info.file.shares?.public?.[event.channel_id]?.[0]?.ts,
          text: `Converted email to Canvas: <${canvas.canvas_id}>`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `:email: *${title}*\n<https://slack.com/docs/${canvas.canvas_id}|View in Canvas>`,
              },
            },
          ],
        });
      }
      logger.info("Processed email to canvas", canvas.canvas_id);
    } catch (error) {
      logger.error("Error processing file_shared event:", error);
    }
  };
}
