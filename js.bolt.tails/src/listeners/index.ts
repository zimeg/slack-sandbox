import { App } from '@slack/bolt';

import commands from './commands';
import events from './events';
import messages from './messages';
import options from './options';

const registerListeners = (app: App) => {
    commands.register(app);
    events.register(app);
    messages.register(app);
    options.register(app);
};

export default registerListeners;
