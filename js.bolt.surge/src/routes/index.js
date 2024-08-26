import Count from "../api/count.js";
import Dotenv from "../config/dotenv.js";
import Database from "../database/index.js";
import surgemail from "./surgemail/index.js";

export default class Routes {
  /**
   * @type {import("@slack/oauth").CallbackOptions}
   */
  callbackOptions;

  /**
   * @typedef {import("@slack/bolt").CustomRoute} CustomRoute
   */

  /**
   * @type {CustomRoute[]}
   */
  customRoutes;

  /**
   * Pages on the public web with some authorizations sometimes.
   * @constructor
   * @param {Dotenv} _env - Customized values for an environment.
   * @param {Database} db - Storage of data that should be lasting.
   */
  constructor(_env, db) {
    const count = new Count(db);
    this.callbackOptions = {
      failureAsync: async (error, _, req, res) =>
        surgemail(req, res, { count: await count.get(), error }),
      successAsync: async (installation, _, req, res) =>
        surgemail(req, res, {
          count: await count.get(),
          success: `slack://app?team=${installation.team?.id}&id=${installation.appId}`, // FIXME
        }),
    };
    this.customRoutes = [
      {
        path: "/",
        method: ["GET"],
        handler: async (req, res) =>
          surgemail(req, res, { count: await count.get() }),
      },
      {
        path: "/api/v1/count",
        method: ["GET"],
        handler: async (_, res) => {
          const clicks = await count.get();
          res.writeHead(200);
          res.end(`${clicks}`);
        },
      },
      {
        path: "/api/v1/count",
        method: ["POST"],
        handler: async (_, res) => {
          const clicks = await count.post();
          res.writeHead(201);
          res.end(`${clicks}`);
        },
      },
      {
        path: "/slack",
        method: ["GET"],
        handler: async (req, res) =>
          surgemail(req, res, { count: await count.get(), slack: true }),
      },
    ];
  }
}
