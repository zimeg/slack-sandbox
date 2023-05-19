import { App } from '@slack/bolt';

import { appHomeOpened } from './app-home';
import { memberJoinedChannel, memberLeftChannel } from './channel-membership';
import { reactionAdded } from './reaction-added';

const register = (app: App) => {
    app.event('app_home_opened', appHomeOpened);
    app.event('member_joined_channel', memberJoinedChannel);
    app.event('member_left_channel', memberLeftChannel);
    app.event('reaction_added', reactionAdded);
};

export default { register };
