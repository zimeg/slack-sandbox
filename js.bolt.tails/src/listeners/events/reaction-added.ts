import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";

/**
 * @see {@link https://api.slack.com/events/reaction_added}
 */
export async function reactionAdded({
  event,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"reaction_added">) {
  const { channel } = event.item;
  console.log(`Reaction added in #${channel}!`);
}
