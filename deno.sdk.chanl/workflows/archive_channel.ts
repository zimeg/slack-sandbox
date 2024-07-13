import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";

const ArchiveChannel = DefineWorkflow({
  callback_id: "archive_channel",
  title: "Archive a channel",
  description: "Hide artifacts of past experiments",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["channel_id"],
  },
});

ArchiveChannel.addStep(Schema.slack.functions.SendMessage, {
  channel_id: ArchiveChannel.inputs.channel_id,
  message: "Archive this channel when the time is right",
  interactive_blocks: [{
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Archive",
        },
        style: "danger",
        value: "archive",
        action_id: "archive_channel",
      },
    ],
  }],
});

ArchiveChannel.addStep(Schema.slack.functions.ArchiveChannel, {
  channel_id: ArchiveChannel.inputs.channel_id,
});

export default ArchiveChannel;
