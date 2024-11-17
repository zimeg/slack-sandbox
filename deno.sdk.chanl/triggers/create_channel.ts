import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import CreateChannel from "../workflows/create_channel.ts";

const trigger: Trigger<typeof CreateChannel.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Ephemerate channel",
  description: "Summon a place to post",
  workflow: `#/workflows/${CreateChannel.definition.callback_id}`,
  inputs: {
    channel_name: {
      value: "slack-sandbox-spam",
    },
    creator_id: {
      value: TriggerContextData.Shortcut.user_id,
    },
  },
};

export default trigger;
