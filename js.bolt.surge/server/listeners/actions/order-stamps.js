import { buildAppHomeBlocks } from "../views/app-home.js";

/**
 * @typedef {Object} OrderStampsOptions
 * @property {import("../../lib/database/index.js").Database} db
 */

/**
 * Create a callback for order_stamps button actions.
 * @param {OrderStampsOptions} options
 * @returns {import("@slack/bolt").Middleware<import("@slack/bolt").SlackActionMiddlewareArgs>}
 */
export default function orderStampsCallback(options) {
  return async ({ ack, body, client, context, logger }) => {
    await ack();
    try {
      const teamId = context.teamId;
      const enterpriseId = context.isEnterpriseInstall
        ? context.enterpriseId
        : undefined;

      await options.db.grantBonusCredit({ teamId, enterpriseId });

      const balance = await options.db.getBalance({ teamId, enterpriseId });
      const delivered = await options.db.getUsageCount({
        teamId,
        enterpriseId,
      });

      await client.views.publish({
        user_id: body.user.id,
        view: {
          type: "home",
          blocks: buildAppHomeBlocks({
            botUserId: context.botUserId,
            balance,
            delivered,
          }),
        },
      });
    } catch (error) {
      logger.error("Failed to process order_stamps action", {
        error,
        userId: body.user.id,
      });
    }
  };
}
