import { App } from "@slack/bolt";
import ticketCommandCallback from "./ticket-command";

const register = (app: App) => {
  app.command("/ticket", ticketCommandCallback);
};

export default { register };
