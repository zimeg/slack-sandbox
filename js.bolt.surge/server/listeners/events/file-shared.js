import { generateText } from "ai";

/**
 * @typedef {Object} FileSharedOptions
 * @property {import("../../lib/database/index.js").Database} db
 */

/**
 * Create a callback for file_shared events that processes emails.
 * @param {FileSharedOptions} options
 * @returns {import("@slack/bolt").Middleware<import("@slack/bolt").SlackEventMiddlewareArgs<'file_shared'>>}
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

      const model = process.env.AI_MODEL || "anthropic/claude-haiku-4.5";
      const { text, usage } = await generateText({
        model,
        system: `Convert the following email into markdown. Use verbatim wording. Remove tracking pixels, tracking links, footers, unsubscribe links, and legal boilerplate. Never remove relevant detail.`,
        prompt: file.preview,
      });

      const fromAddr = file.from?.[0];
      const toAddr = file.to?.[0];
      const fromStr =
        fromAddr?.name && fromAddr?.address
          ? `${fromAddr.name} <${fromAddr.address}>`
          : fromAddr?.name || fromAddr?.address;
      const toStr =
        toAddr?.name && toAddr?.address
          ? `${toAddr.name} <${toAddr.address}>`
          : toAddr?.name || toAddr?.address;
      const dateStr = file.headers?.date;
      const subject = file.subject;

      const header = [
        fromStr && `📤 *From:* ${fromStr}`,
        toStr && `📥 *To:* ${toStr}`,
        subject && `📝 *Subject:* ${subject}`,
        dateStr && `📅 *Date:* ${dateStr}`,
      ]
        .filter(Boolean)
        .join("\n");

      if (!text) {
        logger.warn("AI returned no content for email", event.file_id);
        return;
      }
      const content = text
        .replace(/^\s*```\w*\n?/, "")
        .replace(/\n?```\s*$/, "");

      await options.db.deductCredit({
        teamId,
        enterpriseId,
        model,
        inputTokens: usage?.inputTokens ?? 0,
        outputTokens: usage?.outputTokens ?? 0,
        totalTokens: usage?.totalTokens ?? 0,
        referenceId: event.file_id,
      });

      const title = file.title || file.name || "(No Subject)";
      const shares = info.file.shares;
      const threadTs =
        shares?.public?.[event.channel_id]?.[0]?.ts ??
        shares?.private?.[event.channel_id]?.[0]?.ts;

      if (event.channel_id && threadTs) {
        await client.filesUploadV2({
          channel_id: event.channel_id,
          thread_ts: threadTs,
          content,
          filename: `${title}.md`,
          title: `:email: ${title}`,
          initial_comment: header,
        });
        await options.db.incrementMessageCount("slack");
      }

      logger.info("Processed email to markdown", event.file_id);
    } catch (error) {
      logger.error("Error processing file_shared event:", error);
    }
  };
}
