import boltPkg from "@slack/bolt";
import oauthPkg from "@slack/oauth";
import { VercelReceiver } from "@vercel/slack-bolt";
import { db } from "./lib/database/index.js";
import { createInstallProvider } from "./lib/oauth/index.js";
import { DatabaseStateStore } from "./lib/oauth/state-store.js";
import { registerListeners } from "./listeners/index.js";

const { App, LogLevel, SocketModeReceiver } = boltPkg;
const { InstallProvider } = oauthPkg;

const isProduction = process.env.SLACK_ENVIRONMENT_TAG === "production";
const isVercel = Boolean(process.env.VERCEL);
const defaultLogLevel = isProduction ? LogLevel.INFO : LogLevel.DEBUG;
const logLevel =
  /** @type {boltPkg.LogLevel | undefined} */ (process.env.LOG_LEVEL) ||
  defaultLogLevel;

/**
 * Receiver for handling Slack events.
 * - Vercel (production/preview): VercelReceiver (HTTP)
 * - Local development: SocketModeReceiver (WebSocket)
 */
export const receiver = isVercel
  ? new VercelReceiver({
      logLevel,
    })
  : new SocketModeReceiver({
      appToken: /** @type {string} */ (process.env.SLACK_APP_TOKEN),
      logLevel,
    });

/**
 * OAuth install provider for multi-workspace support.
 */
const installProvider = createInstallProvider(db);

/**
 * Shared OAuth installer for install/callback handlers.
 */
export const installer = new InstallProvider({
  clientId: /** @type {string} */ (process.env.SLACK_CLIENT_ID),
  clientSecret: /** @type {string} */ (process.env.SLACK_CLIENT_SECRET),
  stateStore: new DatabaseStateStore(),
  installationStore: installProvider.installationStore,
  directInstall: true,
});

/**
 * The Bolt Slack application.
 * - Vercel (production/preview): Serverless with OAuth for multi-workspace
 * - Local development: Socket Mode with bot token for single workspace
 * @type {App}
 */
export const app = new App(
  isVercel
    ? {
        authorize: async ({ teamId, enterpriseId, isEnterpriseInstall }) => {
          const installation =
            await installProvider.installationStore.fetchInstallation({
              teamId,
              enterpriseId,
              isEnterpriseInstall: isEnterpriseInstall ?? false,
            });
          return {
            botToken: installation.bot?.token,
            botId: installation.bot?.id,
            botUserId: installation.bot?.userId,
            teamId: installation.team?.id,
            enterpriseId: installation.enterprise?.id,
          };
        },
        signingSecret: process.env.SLACK_SIGNING_SECRET,
        receiver,
        deferInitialization: true,
        logLevel,
      }
    : {
        token: process.env.SLACK_BOT_TOKEN,
        receiver,
        logLevel,
      },
);

registerListeners(app, { db });
