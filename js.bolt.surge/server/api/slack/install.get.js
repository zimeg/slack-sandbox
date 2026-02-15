import { installer } from "../../app.js";

/**
 * Redirect to Slack OAuth authorization page.
 * @param {import("h3").H3Event} event
 */
export default defineEventHandler(async (event) => {
  const origin = getRequestURL(event).origin;

  /** @type {string | undefined} */
  let redirectUrl;

  await installer.handleInstallPath(
    /** @type {import("http").IncomingMessage} */ ({
      url: getRequestURL(event).toString(),
      headers: getHeaders(event),
    }),
    /** @type {import("http").ServerResponse} */ (
      /** @type {unknown} */ ({
        setHeader: (/** @type {string} */ name, /** @type {string} */ value) =>
          setResponseHeader(event, name, value),
        getHeader: (/** @type {string} */ name) =>
          getResponseHeader(event, name),
        writeHead: () => {},
        end: () => {
          const location = getResponseHeader(event, "Location");
          if (location) {
            redirectUrl = /** @type {string} */ (location);
          }
        },
      })
    ),
    {},
    {
      scopes: [
        "canvases:write",
        "channels:history",
        "chat:write",
        "files:read",
      ],
      redirectUri: `${origin}/api/slack/oauth_redirect`,
    },
  );

  if (redirectUrl) {
    return sendRedirect(event, redirectUrl);
  }

  const location = getResponseHeader(event, "Location");
  if (location) {
    return sendRedirect(event, /** @type {string} */ (location));
  }

  throw createError({
    statusCode: 500,
    message: "Failed to generate install URL",
  });
});
