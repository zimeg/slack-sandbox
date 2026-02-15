/**
 * @typedef {Object} AppHomeOpenedOptions
 * @property {import("../../lib/database/index.js").Database} db
 */

/**
 * Create a callback for app_home_opened events.
 * @param {AppHomeOpenedOptions} options
 * @returns {import("@slack/bolt").Middleware<import("@slack/bolt").SlackEventMiddlewareArgs<'app_home_opened'>>}
 */
export default function appHomeOpenedCallback(options) {
  return async ({ client, event, context, logger }) => {
    if (event.tab !== "home") {
      return;
    }
    try {
      const teamId = context.teamId;
      const enterpriseId = context.isEnterpriseInstall
        ? context.enterpriseId
        : undefined;

      const balance = await options.db.getBalance({ teamId, enterpriseId });

      const response = await client.views.publish({
        user_id: event.user,
        view: {
          type: "home",
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: ":mailbox:",
                emoji: true,
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "Sorting emails sent to channels and similar things coming soon!",
              },
            },
            {
              type: "divider",
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `*Credits available:* ${balance}`,
                },
              ],
            },
          ],
        },
      });
      if (!response.ok) {
        throw new Error(response.error);
      }
    } catch (error) {
      logger.error(error);
    }
  };
}
