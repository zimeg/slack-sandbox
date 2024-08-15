import { App } from "@slack/bolt";
import optionGroupsCallback from "./groups";

const register = (app: App) => {
  app.options("options_callback", optionGroupsCallback);
};

export default { register };
