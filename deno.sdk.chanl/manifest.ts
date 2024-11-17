import { Manifest } from "deno-slack-sdk/mod.ts";
import ArchiveChannel from "./workflows/archive_channel.ts";
import CreateChannel from "./workflows/create_channel.ts";

export default Manifest({
  name: "chanl",
  description: "messaging around ephemeral areas",
  icon: "assets/icon.png",
  workflows: [ArchiveChannel, CreateChannel],
  botScopes: [
    "bookmarks:write",
    "channels:manage",
    "chat:write",
    "chat:write.public",
    "commands",
    "groups:write",
    "metadata.message:read",
    "pins:write",
  ],
});
