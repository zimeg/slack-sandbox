import boltPkg from "@slack/bolt";
import { VercelReceiver } from "@vercel/slack-bolt";
import { generateText } from "ai";
import { db } from "./lib/database/index.js";
import { createInstallProvider } from "./lib/oauth/index.js";
import { DatabaseStateStore } from "./lib/oauth/state-store.js";
import { registerListeners } from "./listeners/index.js";

const { App, LogLevel, SocketModeReceiver } = boltPkg;

const isProduction = process.env.SLACK_ENVIRONMENT_TAG === "production";
const isVercel = Boolean(process.env.VERCEL);
const defaultLogLevel = isProduction ? LogLevel.INFO : LogLevel.DEBUG;
const logLevel =
  /** @type {boltPkg.LogLevel | undefined} */ (process.env.LOG_LEVEL) ||
  defaultLogLevel;

const installProvider = createInstallProvider(db);

/**
 * Receiver for handling Slack events.
 * - Vercel (production/preview): VercelReceiver (HTTP)
 * - Local development: SocketModeReceiver (WebSocket)
 */
export const receiver = isVercel
  ? new VercelReceiver({
      logLevel,
      installationStore: installProvider.installationStore,
      installerOptions: {
        stateStore: new DatabaseStateStore(),
        directInstall: true,
        callbackOptions: {
          successAsync: async (installation, _installOptions, _req, res) => {
            const teamId = installation.team?.id;
            const appId = installation.appId;
            if (teamId && appId) {
              const deeplink = encodeURIComponent(
                `slack://app?team=${teamId}&id=${appId}&tab=home`,
              );
              res.writeHead(302, {
                Location: `/?success=true&redirect=${deeplink}`,
              });
            } else {
              res.writeHead(302, { Location: "/?success=true" });
            }
            res.end();
          },
          failureAsync: async (error, _installOptions, _req, res) => {
            res.writeHead(302, {
              Location: `/?error=${encodeURIComponent(error.message)}`,
            });
            res.end();
          },
        },
      },
    })
  : new SocketModeReceiver({
      appToken: /** @type {string} */ (process.env.SLACK_APP_TOKEN),
      logLevel,
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

registerListeners(app, { db, generate: generateText });
