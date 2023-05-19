import { SlackOptionsMiddlewareArgs, OptionGroups, BlockOptions } from "@slack/bolt";

// TODO!
// @see: https://api.slack.com/reference/block-kit/composition-objects#option_group

export default async ({
    ack
}: SlackOptionsMiddlewareArgs<"interactive_message">) => {

    const option_groups: OptionGroups<BlockOptions> = {
        option_groups: [
            {
                label: {
                    type: "plain_text",
                    text: "Group 1",
                },
                options: [
                    {
                        text: {
                            type: "plain_text",
                            text: "*this is plain_text text*",
                        },
                        value: "value-0",
                    },
                    {
                        text: {
                            type: "plain_text",
                            text: "*this is plain_text text*",
                        },
                        value: "value-1",
                    },
                    {
                        text: {
                            type: "plain_text",
                            text: "*this is plain_text text*",
                        },
                        value: "value-2",
                    },
                ],
            },
            {
                label: {
                    type: "plain_text",
                    text: "Group 2",
                },
                options: [
                    {
                        text: {
                            type: "plain_text",
                            text: "*this is plain_text text*",
                        },
                        value: "value-3",
                    },
                ],
            },
        ],
    };

    await ack(option_groups);
};
