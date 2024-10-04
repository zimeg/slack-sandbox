import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import Video from "../../videos";

/**
 * Cache the video at the shared link.
 * @see {@link https://api.slack.com/events/link_shared}
 */
export async function linkShared({
  client,
  event,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"link_shared">) {
  const { links, source } = event;
  if (source != "conversations_history") {
    return;
  }
  for (let n = 0; n < links.length; n++) {
    try {
      const link = links[n];
      const video = new Video(link.url);
      await video.download();
    } catch (e: any) {
      console.error("Failed to download a link:", e);
    }
  }
}
