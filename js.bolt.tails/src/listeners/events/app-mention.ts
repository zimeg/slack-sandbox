import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";

export const appMention = async ({
  client,
  event,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"app_mention">) => {
  const { channel } = event;
  const result = await client.chat.postMessage({
    channel,
    text: "what's up?",
  });
  if (!result.ok) {
    console.error("Failed to respond to a calling!");
  }
};
