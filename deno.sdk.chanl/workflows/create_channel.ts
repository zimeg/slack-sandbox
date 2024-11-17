import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";

const CreateChannel = DefineWorkflow({
  callback_id: "create_channel",
  title: "Create a channel",
  description: "Make a space for messages with noise",
  input_parameters: {
    properties: {
      channel_name: {
        type: Schema.types.string,
      },
      creator_id: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["channel_name", "creator_id"],
  },
});

const channel = CreateChannel.addStep(Schema.slack.functions.CreateChannel, {
  channel_name: CreateChannel.inputs.channel_name,
});

CreateChannel.addStep(Schema.slack.functions.UpdateChannelTopic, {
  channel_id: channel.outputs.channel_id,
  topic: ":speaking_head_in_silhouette:",
});

const message = CreateChannel.addStep(Schema.slack.functions.SendMessage, {
  channel_id: channel.outputs.channel_id,
  message: `<#${channel.outputs.channel_id}> \`${channel.outputs.channel_id}\``,
  metadata: {
    event_type: "ephemeral_channel_created",
    event_payload: {
      channel_id: channel.outputs.channel_id,
    },
  },
});

CreateChannel.addStep(Schema.slack.functions.AddPin, {
  channel_id: channel.outputs.channel_id,
  message: message.outputs.message_link,
});

CreateChannel.addStep(Schema.slack.functions.AddBookmark, {
  channel_id: channel.outputs.channel_id,
  link: "https://api.slack.com/docs",
  name: "API Documentation",
});

CreateChannel.addStep(Schema.slack.functions.AddBookmark, {
  channel_id: channel.outputs.channel_id,
  link: "https://app.slack.com/block-kit-builder",
  name: "Block Kit Builder",
});

CreateChannel.addStep(Schema.slack.functions.AddBookmark, {
  channel_id: channel.outputs.channel_id,
  link: "https://slack.dev",
  name: "SDK Documentation",
});

CreateChannel.addStep(Schema.slack.functions.InviteUserToChannel, {
  channel_ids: [channel.outputs.channel_id],
  user_ids: [CreateChannel.inputs.creator_id],
});

export default CreateChannel;
