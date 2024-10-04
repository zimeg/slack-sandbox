import { App } from "@slack/bolt";

import events from "./events";
import messages from "./messages";
import options from "./options";

const registerListeners = (app: App) => {
  events.register(app);
  messages.register(app);
  options.register(app);
};

export default registerListeners;
