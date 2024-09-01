import childProcess from "node:child_process";
import util from "node:util";
import config from "../config";

const exec = util.promisify(childProcess.exec);

export type DownloadOptions = {
  /**
   * Location of the download relative to the project root.
   */
  filepath: string;
};

/**
 * A media file that contains sound and images in sequence. These are often
 * paired together for viewing pleasures.
 */
export default class Video {
  private id: string;
  private url: URL;

  /**
   * Builder of videos from a simple URL.
   * @param url - an internet video path.
   */
  constructor(url: string) {
    this.id = this.setID(url);
    this.url = new URL(url);
  }

  /**
   * Save the video at a URL to the filepath. Extensions are provided.
   * @param options - available customizations for this file download.
   * @link https://github.com/yt-dlp/yt-dlp
   */
  async download(
    options: DownloadOptions = {
      filepath: `${config.CACHE_DIRECTORY}/${this.id}`,
    },
  ) {
    const args = ["yt-dlp", this.url, "-o", options.filepath];
    const download = await exec(args.join(" "));
    if (download.stderr) {
      console.error(download.stderr);
    }
  }

  /**
   * Return the unique video ID.
   * @returns a unique video ID.
   */
  getID(): string {
    return this.id;
  }

  /**
   * Configure the video with some unique ID.
   * @params url - the internet path of video.
   * @returns the ID after also setting it.
   */
  setID(url: string): string {
    if (url.length <= 0) {
      throw new Error("No video URL was provided");
    }
    const parsed = new URL(url);
    switch (parsed.hostname) {
      case "www.youtube.com":
        if (parsed.pathname.startsWith("/shorts/")) {
          this.id = parsed.pathname.split("/")[2];
          return this.id;
        }
        const id = parsed.searchParams.get("v");
        if (id) {
          this.id = id;
          return this.id;
        }
        break;
      case "youtu.be":
        if (parsed.pathname.startsWith("/")) {
          this.id = parsed.pathname.split("/")[1];
          return this.id;
        }
        break;
    }
    console.error("Failed to detect a video ID:", url);
    throw new Error("No video ID was found");
  }
}
