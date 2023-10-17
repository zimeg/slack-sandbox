const { Manifest } = require('@slack/bolt');
const { ModalizerWorkflow } = require('./workflows/modalizer');

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
module.exports = Manifest({
  runOnSlack: false,
  name: 'Squid modalizer',
  displayName: 'Squid modalizer',
  description: 'The tactile tentaclizer',
  botScopes: ['channels:history', 'chat:write', 'commands', 'chat:write.public'],
  eventSubscriptions: { bot_events: ['app_home_opened', 'message.channels'] },
  socketModeEnabled: true,
  workflows: [ModalizerWorkflow],
  features: {
    appHome: {
      homeTabEnabled: true,
      messagesTabEnabled: false,
      messagesTabReadOnlyEnabled: true,
    },
    botUser: {
      always_online: false,
    },
  },
  settings: {
    interactivity: {
      is_enabled: true,
    },
  },
});
