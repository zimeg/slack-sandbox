/**
 * Build the App Home view blocks.
 * @param {Object} params
 * @param {string} params.botUserId
 * @param {number} params.delivered
 * @returns {import("@slack/types").KnownBlock[]}
 */
export function buildAppHomeBlocks({ botUserId, delivered }) {
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
        text: `*Quick Start*\n1. Set up <https://slack.com/help/articles/206819278-Send-emails-to-Slack|email forwarding> to a channel\n2. Invite <@${botUserId}> to that channel\n3. Wait for emails to arrive as markdown in threads`,
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Stamps sent this month:* ${delivered.toLocaleString()} / 1,000`,
      },
    },
  ];
}
