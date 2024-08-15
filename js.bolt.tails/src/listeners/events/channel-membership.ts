import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";

export const memberJoinedChannel = async ({
  client,
  event,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"member_joined_channel">) => {
  const result = await client.chat.postMessage({
    channel: event.user,
    text: `Welcome to <#${event.channel}> :sunglasses:`,
  });

  if (!result.ok) {
    console.error("Failed to say hello!");
  }
};

export const memberLeftChannel = async ({
  client,
  event,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"member_left_channel">) => {
  const result = await client.chat.postMessage({
    channel: event.user,
    text: `So long <#${event.channel}>! :wave:`,
  });

  if (!result.ok) {
    console.error("Failed to say goodbye!");
  }
};
