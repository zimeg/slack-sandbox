/**
 * Create a callback for order_stamps button actions.
 * @returns {import("@slack/bolt").Middleware<import("@slack/bolt").SlackActionMiddlewareArgs>}
 */
export default function orderStampsCallback() {
  return async ({ ack, body, client, logger }) => {
    await ack();
    try {
      await client.chat.postEphemeral({
        channel: body.channel?.id,
        user: body.user.id,
        text: "Ordering more stamps is coming soon.",
      });
    } catch (error) {
      logger.error("Failed to process order_stamps action", {
        error,
        userId: body.user.id,
      });
    }
  };
}
