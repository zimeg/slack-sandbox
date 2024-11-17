import bolt from "@slack/bolt";
import {
  EnvironmentVariableInvalidError,
  EnvironmentVariableMissingError,
} from "../errors/index.js";
import tags from "./tags.js";

/**
 * @readonly
 * @enum {string} known and stable environment variable names.
 * @property {string} DATABASE_URL "DATABASE_URL"
 * @property {string} SLACK_CLIENT_ID "SLACK_CLIENT_ID"
 * @property {string} SLACK_CLIENT_SECRET "SLACK_CLIENT_SECRET"
 * @property {string} SLACK_ENVIRONMENT_TAG "SLACK_ENVIRONMENT_TAG"
 * @property {string} SLACK_FILE_INSTALLATION_STORE "SLACK_FILE_INSTALLATION_STORE"
 * @property {string} SLACK_LOG_LEVEL "SLACK_LOG_LEVEL"
 * @property {string} SLACK_SIGNING_SECRET "SLACK_SIGNING_SECRET"
 * @property {string} SLACK_STATE_SECRET "SLACK_STATE_SECRET"
 * @property {string} PORT "PORT"
 */
const env = {
  DATABASE_URL: "DATABASE_URL",
  SLACK_CLIENT_ID: "SLACK_CLIENT_ID",
  SLACK_CLIENT_SECRET: "SLACK_CLIENT_SECRET",
  SLACK_ENVIRONMENT_TAG: "SLACK_ENVIRONMENT_TAG",
  SLACK_FILE_INSTALLATION_STORE: "SLACK_FILE_INSTALLATION_STORE",
  SLACK_LOG_LEVEL: "SLACK_LOG_LEVEL",
  SLACK_SIGNING_SECRET: "SLACK_SIGNING_SECRET",
  SLACK_STATE_SECRET: "SLACK_STATE_SECRET",
  PORT: "PORT",
};

export default class Dotenv {
  /**
   * @typedef Variables
   * @prop {string} clientId
   * @prop {string} clientSecret
   * @prop {string | undefined} databaseUrl
   * @prop {string | undefined} fileInstallationStore
   * @prop {bolt.LogLevel | undefined} logLevel
   * @prop {number | undefined} port
   * @prop {string} signingSecret
   * @prop {string} stateSecret
   * @prop {string} tag
   */

  /**
   * The collection of known environment variables.
   * @type Variables
   */
  vars;

  /**
   * @constructor
   */
  constructor() {
    this.vars = {
      clientId: this.getClientId(env.SLACK_CLIENT_ID),
      clientSecret: this.getClientSecret(env.SLACK_CLIENT_SECRET),
      databaseUrl: this.getDatabaseUrl(env.DATABASE_URL),
      fileInstallationStore: this.getFileInstallationStore(
        env.SLACK_FILE_INSTALLATION_STORE,
      ),
      logLevel: this.getLogLevel(env.SLACK_LOG_LEVEL),
      port: this.getPort(env.PORT),
      signingSecret: this.getSigningSecret(env.SLACK_SIGNING_SECRET),
      stateSecret: this.getStateSecret(env.SLACK_STATE_SECRET),
      tag: this.getTag(env.SLACK_ENVIRONMENT_TAG),
    };
  }

  /**
   * Collect the client ID from the environment variable.
   * @param {string} env SLACK_CLIENT_ID
   * @returns {string} bolt app client ID.
   * @throws {EnvironmentVariableMissingError}
   */
  getClientId(env) {
    if (!process.env[env]) {
      throw new EnvironmentVariableMissingError(env);
    }
    return process.env[env];
  }

  /**
   * Collect the client secret from the environment variable.
   * @param {string} env SLACK_CLIENT_SECRET
   * @returns {string} bolt app client secret.
   * @throws {EnvironmentVariableMissingError}
   */
  getClientSecret(env) {
    if (!process.env[env]) {
      throw new EnvironmentVariableMissingError(env);
    }
    return process.env[env];
  }

  /**
   * Collect the database URL from the environment variable.
   * @param {string} env DATABASE_URL
   * @returns {string=} application database url.
   */
  getDatabaseUrl(env) {
    return process.env[env];
  }

  /**
   * Collect the file installation store from the environment variable.
   * @param {string} env SLACK_FILE_INSTALLATION_STORE
   * @returns {string=} bolt app file installation store path.
   */
  getFileInstallationStore(env) {
    return process.env[env];
  }

  /**
   * Collect the log level from the environment variable.
   * @param {string} env SLACK_LOG_LEVEL
   * @returns {bolt.LogLevel=} amount of noise from the application.
   * @throws {EnvironmentVariableMissingError}
   */
  getLogLevel(env) {
    if (!process.env[env]) {
      return;
    }
    /**
     * @type {bolt.LogLevel[]}
     */
    const options = [
      bolt.LogLevel.DEBUG,
      bolt.LogLevel.INFO,
      bolt.LogLevel.WARN,
      bolt.LogLevel.ERROR,
    ];
    if (!options.filter((level) => level === process.env[env])) {
      throw new EnvironmentVariableInvalidError(env);
    } else {
      return /** @type bolt.LogLevel */ (process.env[env]);
    }
  }
  /**
   * Collect the application port from the environment variable.
   * @param {string} env PORT
   * @returns {number=} application port.
   * @throws {EnvironmentVariableInvalidError}
   */
  getPort(env) {
    const value = process.env[env];
    if (!value) {
      return;
    }
    const port = Number(value);
    if (isNaN(port)) {
      throw new EnvironmentVariableMissingError(env);
    }
    return port;
  }

  /**
   * Collect the signing secret from the environment variable.
   * @param {string} env SLACK_SIGNING_SECRET
   * @returns {string} bolt app signing secret.
   * @throws {EnvironmentVariableMissingError}
   */
  getSigningSecret(env) {
    if (!process.env[env]) {
      throw new EnvironmentVariableMissingError(env);
    }
    return process.env[env];
  }

  /**
   * Collect the state secret from the environment variable.
   * @param {string} env SLACK_STATE_SECRET
   * @returns {string} bolt app state secret.
   * @throws {EnvironmentVariableMissingError}
   */
  getStateSecret(env) {
    if (!process.env[env]) {
      throw new EnvironmentVariableMissingError(env);
    }
    return process.env[env];
  }

  /**
   * Collect the environment tag from the environment variable.
   * @param {string} env SLACK_ENVIRONMENT_TAG
   * @returns {string} bolt app environment tag.
   * @throws {EnvironmentVariableInvalidError}
   * @throws {EnvironmentVariableMissingError}
   */
  getTag(env) {
    if (!process.env[env]) {
      throw new EnvironmentVariableMissingError(env);
    }
    if (!Object.keys(tags).filter((tag) => tag === process.env[env])) {
      throw new EnvironmentVariableInvalidError(env);
    } else {
      return process.env[env];
    }
  }
}
