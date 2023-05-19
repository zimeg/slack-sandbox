import { App } from '@slack/bolt';
import greetingMessageCallback from './greeting';

const register = (app: App) => {
    app.message(/^(hi|hello|hey).*/, greetingMessageCallback);
};

export default { register };
