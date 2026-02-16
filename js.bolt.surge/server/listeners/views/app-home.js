/**
 * Build the App Home view blocks.
 * @param {Object} params
 * @param {string} params.botUserId
 * @param {number} params.balance
 * @param {number} params.delivered
 * @returns {import("@slack/bolt").KnownBlock[]}
 */
export function buildAppHomeBlocks({ botUserId, balance, delivered }) {
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: ":mailbox_with_mail: surge",
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `<@${botUserId}> delivers email as markdown to channels around.`,
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Quick Start*\n1. Set up <https://slack.com/help/articles/206819278-Send-emails-to-Slack|email forwarding> to a channel\n2. Invite <@${botUserId}> to that channel\n3. Emails arrive as markdown files in threads`,
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Messages delivered:* ${delivered}\n*Stamps remaining:* ${balance}`,
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Order more stamps",
            emoji: true,
          },
          action_id: "order_stamps",
        },
      ],
    },
  ];
}
