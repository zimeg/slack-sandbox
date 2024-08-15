import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import Video from "../../videos";

/*
 * Cache the video at the shared link.
 */
export const linkShared = async ({
  event,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"link_shared">) => {
  const { channel, links } = event;
  if (channel === "COMPOSER") {
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
};
