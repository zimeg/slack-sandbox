import { WebClient } from "@slack/web-api";

/*
 * try {
 *   const channelName = "reading-list";
 *   const channelId = await findChannelId(client, channelName);
 *   console.log(channelId);
 * } catch (err) {
 *   console.error(err);
 * }
 */

export async function findChannelId(client: WebClient, channelName: string) {
  let channelId = null;
  let cursor = undefined;

  while (!channelId) {
    const response = await client.conversations.list({
      exclude_archived: true,
      cursor,
    });

    if (!response.ok || !response.channels || !response.response_metadata) {
      throw new Error(response.error);
    }

    response.channels.forEach((channel) => {
      if (channel.name === channelName) {
        channelId = channel.id;
      }
    });

    cursor = response.response_metadata.next_cursor;
    if (cursor === "" && !channelId) {
      throw new Error("Channel not found!");
    }
  }
  return channelId;
}
