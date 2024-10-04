import { App } from "@slack/bolt";
import { appHomeOpened } from "./app-home";
import { linkShared } from "./link-shared";
import { reactionAdded } from "./reaction-added";

function register(app: App) {
  app.event("app_home_opened", appHomeOpened);
  app.event("link_shared", linkShared);
  app.event("reaction_added", reactionAdded);
}

export default { register };
