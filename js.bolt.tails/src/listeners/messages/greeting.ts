import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";

export default async ({
    client,
    context,
    event,
    message,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"message">) => {
    const { channel } = event;
    const { text } = message as any;
    if (context.botUserId && text.indexOf(`<@${context.botUserId}>`) != -1) {
        return;
    }
    const result = await client.chat.postMessage({
        channel,
        text: "howdy!",
    });
    if (!result.ok) {
        console.error("Failed to return a greeting!");
    }
};
