import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";

export default async ({
    client
}: SlackEventMiddlewareArgs<"message"> & AllMiddlewareArgs) => {
    console.log("-someone sent a greeting-");

    const result = await client.chat.postMessage({
        channel: "C04CRUE6MU3",
        text: "howdy!",
    });

    if (!result.ok) {
        console.error("Failed to return a greeting!");
    }
};
