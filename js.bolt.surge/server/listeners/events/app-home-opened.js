import { buildAppHomeBlocks } from "../views/app-home.js";

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
      const delivered = await options.db.getUsageCount({
        teamId,
        enterpriseId,
      });

      const response = await client.views.publish({
        user_id: event.user,
        view: {
          type: "home",
          blocks: buildAppHomeBlocks({
            botUserId: context.botUserId,
            balance,
            delivered,
          }),
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
