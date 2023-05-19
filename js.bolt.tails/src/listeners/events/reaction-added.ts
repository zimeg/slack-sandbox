import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";

export const reactionAdded = async ({
    event
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"reaction_added">) => {
    const { channel } = event.item;
    console.log(`Reaction added in #${channel}!`);
};
