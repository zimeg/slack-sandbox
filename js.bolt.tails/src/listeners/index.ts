import { App } from "@slack/bolt";
import events from "./events";

export default function registerListeners(app: App) {
  events.register(app);
}
