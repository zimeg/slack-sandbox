const { DefineFunction, Schema } = require('@slack/bolt');

const OpenCustomModalDefinition = DefineFunction({
  callback_id: 'open_custom_modal',
  title: 'Open a modal',
  description: 'Open a custom modal',
  source_file: 'functions/open-custom-modal.ts',
  input_parameters: {
    properties: {
      interactivityPointer: {
        type: Schema.slack.types.interactivity,
        description: 'Interactivity pointer',
      },
    },
    required: ['interactivityPointer'],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

module.exports = { OpenCustomModalDefinition };
