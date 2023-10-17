const { DefineWorkflow, Schema } = require('@slack/bolt');
const { OpenCustomModalDefinition } = require('../functions/open-custom-modal-definition');

const ModalizerWorkflow = DefineWorkflow({
  callback_id: 'modalizer_workflow',
  title: 'Open a modal',
  description: 'Display a prominent prompt',
  input_parameters: {
    properties: {
      interactivityPointer: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: [],
  },
});

ModalizerWorkflow.addStep(OpenCustomModalDefinition, {
    interactivityPointer: ModalizerWorkflow.inputs.interactivityPointer,
  },
);

module.exports = { ModalizerWorkflow };
