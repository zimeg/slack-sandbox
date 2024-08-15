import { SlackCommandMiddlewareArgs } from "@slack/bolt";
import { WebClient } from "@slack/web-api";

export default async ({
  ack,
  body,
  client,
}: SlackCommandMiddlewareArgs & { client: WebClient }) => {
  await ack();
  console.log("someone is requesting a ticket!");

  try {
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "someCallbackId",
        title: {
          type: "plain_text",
          text: "Modal titlee",
        },
        blocks: [
          {
            type: "section",
            block_id: "selector",
            text: {
              type: "mrkdwn",
              text: "Do you like plain text?",
            },
            accessory: {
              action_id: "option_callback",
              type: "external_select",
              placeholder: {
                type: "plain_text",
                text: "plain_text?",
              },
            },
          },
        ],
      },
    });

    if (!result.ok) {
      throw new Error("Failed to open the ticketing modal!");
    }
  } catch (error) {
    console.error("There was a problem creating a ticket...", error);
  }
};
