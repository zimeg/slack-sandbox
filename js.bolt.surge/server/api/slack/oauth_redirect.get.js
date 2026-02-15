import { installer } from "../../app.js";

/**
 * Handle OAuth callback from Slack.
 * @param {import("h3").H3Event} event
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = /** @type {string} */ (query.code);
  const state = /** @type {string} */ (query.state);

  if (!code || !state) {
    return sendRedirect(event, "/?error=missing_code_or_state");
  }

  /** @type {import("@slack/oauth").Installation | import("@slack/oauth").OrgInstallation | null} */
  let installation = null;

  /** @type {Error | null} */
  let callbackError = null;

  try {
    await installer.handleCallback(
      /** @type {import("http").IncomingMessage} */ ({
        url: getRequestURL(event).toString(),
        headers: getHeaders(event),
      }),
      /** @type {import("http").ServerResponse} */ (
        /** @type {unknown} */ ({
          setHeader: (
            /** @type {string} */ name,
            /** @type {string} */ value,
          ) => setResponseHeader(event, name, value),
          getHeader: (/** @type {string} */ name) =>
            getResponseHeader(event, name),
          writeHead: () => {},
          end: () => {},
        })
      ),
      {
        successAsync: async (inst) => {
          installation = inst;
        },
        failureAsync: async (err) => {
          callbackError = err;
        },
      },
    );

    if (callbackError) {
      throw callbackError;
    }

    const teamId = /** @type {import("@slack/oauth").Installation | null} */ (
      installation
    )?.team?.id;
    const appId = /** @type {import("@slack/oauth").Installation | null} */ (
      installation
    )?.appId;

    if (teamId && appId) {
      const deeplink = encodeURIComponent(
        `slack://app?team=${teamId}&id=${appId}&tab=home`,
      );
      return sendRedirect(event, `/?success=true&redirect=${deeplink}`);
    }
    return sendRedirect(event, "/?success=true");
  } catch (err) {
    const error = /** @type {Error} */ (err);
    return sendRedirect(event, `/?error=${encodeURIComponent(error.message)}`);
  }
});
