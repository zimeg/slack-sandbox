import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import SubmitReceiptWorkflow from "../workflows/submit_receipt.ts";

const submitReceiptTrigger: Trigger<typeof SubmitReceiptWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Submit a new receipt",
  description: "Log past payments for various things",
  workflow: `#/workflows/${SubmitReceiptWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
    channel_id: {
      value: TriggerContextData.Shortcut.channel_id,
    },
    spender_id: {
      value: TriggerContextData.Shortcut.user_id,
    },
  },
};

export default submitReceiptTrigger;
