const { SlackFunction } = require('@slack/bolt');
const { OpenCustomModalDefinition } = require('../../manifest/functions/open-custom-modal-definition');

const openCustomModal = async ({ complete, event, client }) => {
  console.log("Opening the modal!");

  try {
    const response = await client.views.open({
      interactivity_pointer: event.inputs.interactivityPointer.interactivity_pointer,
      view: {
        type: 'modal',
        callback_id: 'first_page',
        title: {
          type: 'plain_text',
          text: 'Sample modal title',
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: 'Hello world!',
              emoji: true,
            },
            accessory: {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Authorize',
                emoji: true,
              },
              value: 'click_me_123',
              url: 'http://localhost:3000/app',
              action_id: 'auth_button',
            },
          },
        ],
        submit: {
          type: 'plain_text',
          text: 'Submit',
        },
      },
    });

    if (!response.ok) {
      throw new Error("Failed to open the modal", response.error);
    }
  } catch (err) {
    await complete({ error: `There was an issue: ${err}` });
    throw (err);
  }
};

const openCustomModalFunc = new SlackFunction(OpenCustomModalDefinition.id, openCustomModal);

openCustomModalFunc.view('first_page', async (_params) => {
  console.log('View submission received!');
});


module.exports = { openCustomModalFunc };