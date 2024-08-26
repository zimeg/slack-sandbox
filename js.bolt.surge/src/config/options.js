import bolt from "@slack/bolt";
import Database from "../database/index.js";
import OAuth from "../oauth/index.js";
import Routes from "../routes/index.js";
import Dotenv from "./dotenv.js";
import tags from "./tags.js";

/**
 * Configurations with optional changes to the Bolt application.
 */
export default class Options {
  /**
   * @typedef {import("@slack/bolt").AppOptions} BoltAppOptions
   */

  /**
   * Specified settings and configured values for this Bolt app.
   * @type BoltAppOptions
   */
  config;

  /**
   * Configure unique App options for the provided tag.
   * @constructor
   * @param {Dotenv} env - Customized values for an environment.
   * @param {Database} db - Storage of data that should be lasting.
   */
  constructor(env, db) {
    const routes = new Routes(env, db);
    this.config = {
      clientId: env.vars.clientId,
      clientSecret: env.vars.clientSecret,
      customRoutes: routes.customRoutes,
      ignoreSelf: true,
      installationStore: new OAuth(env, db).installationStore,
      installerOptions: {
        directInstall: true,
        callbackOptions: routes.callbackOptions,
      },
      logLevel: this.getLogLevel(env),
      port: env.vars.port,
      scopes: ["channels:history", "chat:write"],
      signingSecret: env.vars.signingSecret,
      stateSecret: env.vars.stateSecret,
    };
  }

  /**
   * Collect the log level for corresponding environment.
   * @param {Dotenv} env
   * @returns {bolt.LogLevel}
   */
  getLogLevel(env) {
    if (env.vars.logLevel) {
      return env.vars.logLevel;
    }
    switch (env.vars.tag) {
      case tags.PRODUCTION:
        return bolt.LogLevel.INFO;
      case tags.DEVELOPMENT:
        return bolt.LogLevel.DEBUG;
      default:
        return bolt.LogLevel.DEBUG;
    }
  }
}
