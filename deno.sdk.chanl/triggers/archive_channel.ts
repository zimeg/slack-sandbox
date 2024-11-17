import { Trigger } from "deno-slack-sdk/types.ts";
import {
  TriggerContextData,
  TriggerEventTypes,
  TriggerTypes,
} from "deno-slack-api/mod.ts";
import ArchiveChannel from "../workflows/archive_channel.ts";

const trigger: Trigger<typeof ArchiveChannel.definition> = {
  type: TriggerTypes.Event,
  name: "Archive the channel",
  description: "Evaporate the ephermerate",
  workflow: `#/workflows/${ArchiveChannel.definition.callback_id}`,
  event: {
    event_type: TriggerEventTypes.MessageMetadataPosted,
    all_resources: true,
    metadata_event_type: "ephemeral_channel_created",
  },
  inputs: {
    channel_id: {
      value: TriggerContextData.Event.MessageMetadataPosted.channel_id,
    },
  },
};

export default trigger;
