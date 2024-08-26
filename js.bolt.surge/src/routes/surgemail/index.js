import path from "path";
import ejs from "ejs";

/**
 * @typedef {import("http").IncomingMessage} IncomingMessage
 * @typedef {import("http").ServerResponse} ServerResponse
 * @typedef {import("@slack/bolt/dist/receivers/ParamsIncomingMessage").ParamsIncomingMessage} ParamsIncomingMessage
 */

/**
 * @param {ParamsIncomingMessage} _req
 * @param {ServerResponse} res
 * @param {Record<string, any>}  data
 */
export default function receiver(_req, res, data) {
  const templatePath = path.join(
    process.env.PWD ?? ".", // FIXME: a better path must exist...
    process.env.SLACK_ENVIRONMENT_TAG === "production" ? "" : "src",
    "routes",
    "templates",
    "index.html",
  );
  data.count = data.count ?? 0;
  data.error = data.error ?? false;
  data.slack = data.slack ?? false;
  data.success = data.success ?? false;
  ejs.renderFile(templatePath, data, (err, html) => {
    if (err) {
      console.error(err);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Server error");
      return;
    } else {
      res.writeHead(data.status ?? 200, { "Content-Type": "text/html" });
      res.end(html);
      return;
    }
  });
}
