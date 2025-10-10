/**
 * Respond to visitors of app home with a published view.
 * @param {import("@slack/bolt").AllMiddlewareArgs & import("@slack/bolt").SlackEventMiddlewareArgs<'app_home_opened'>}
 *   arguments - middleware arguments.
 */
export default async function appHomeOpenedCallback({ client, event, logger }) {
  if (event.tab !== "home") {
    return;
  }
  try {
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
        ],
      },
    });
    if (!response.ok) {
      throw new Error(response.error);
    }
  } catch (error) {
    logger.error(error);
  }
}
