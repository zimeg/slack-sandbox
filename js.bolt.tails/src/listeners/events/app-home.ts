import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";

/**
 * @see {@link https://api.slack.com/events/app_home_opened}
 */
export async function appHomeOpened({
  event,
  client,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"app_home_opened">) {
  try {
    const result = await client.views.publish({
      user_id: event.user,
      view: {
        type: "home",
        blocks: [
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Go to channel",
                  emoji: true,
                },
                value: "general",
                url: "slack://channel?team=T02A074M3U3&id=C02APLENHAL",
                action_id: "channel-button-0",
              },
            ],
          },
        ],
      },
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
