import fs from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { ParamsIncomingMessage } from "@slack/bolt/dist/receivers/ParamsIncomingMessage";
import config from "./config";

/**
 * Extract search paramters from the URL
 * @see {@link https://github.com/slackapi/bolt-js/issues/2100}
 */
function params(req: ParamsIncomingMessage): URLSearchParams {
  const queries = req.url?.split("?");
  if (!queries || queries.length != 1) {
    return new URLSearchParams();
  }
  return new URLSearchParams(queries[1]);
}

export default [
  {
    path: "/",
    method: ["GET"],
    handler: (
      _req: ParamsIncomingMessage,
      res: ServerResponse<IncomingMessage>,
    ) => {
      fs.readdir(config.CACHE_DIRECTORY, (err, files) => {
        if (err) {
          return res.writeHead(500).end("Failed to find files: " + err);
        }
        const links = files
          .map((file) => {
            return `<li><a href="/video/${file}">${file}</a></li>`;
          })
          .join("");
        const html = `
          <html>
          <body>
            <h1>tails(browsing)</h1>
            <ul>${links}</ul>
          </body>
          </html>
        `;
        res.end(html);
      });
    },
  },
  {
    path: "/stream/:id",
    method: ["GET"],
    handler: (
      req: ParamsIncomingMessage,
      res: ServerResponse<IncomingMessage>,
    ) => {
      const id = req.params?.id;
      if (!id) {
        return res.writeHead(404).end("No video provided");
      }
      const content = path.join(config.CACHE_DIRECTORY, id);
      fs.access(content, fs.constants.F_OK, (err) => {
        if (err) {
          return res.writeHead(404).end("File not found");
        }
        const stat = fs.statSync(content);
        const fileSize = stat.size;
        const range = req.headers.range;
        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          if (start >= fileSize) {
            res
              .writeHead(416)
              .end(
                "Requested range not satisfied\n" + start + " >= " + fileSize,
              );
            return;
          }
          const chunksize = end - start + 1;
          const file = fs.createReadStream(content, { start, end });
          const head = {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": "video/mp4",
          };
          res.writeHead(206, head);
          file.pipe(res);
        } else {
          const head = {
            "Content-Length": fileSize,
            "Content-Type": "video/mp4",
          };
          res.writeHead(200, head);
          fs.createReadStream(content).pipe(res);
        }
      });
    },
  },
  {
    path: "/video/:id",
    method: ["GET"],
    handler: (
      req: ParamsIncomingMessage,
      res: ServerResponse<IncomingMessage>,
    ) => {
      const content = path.join(config.CACHE_DIRECTORY, req.params?.id || "");
      const queries = params(req);
      if (queries.get("download")) {
        res.writeHead(200);
        return fs.createReadStream(content).pipe(res);
      }
      fs.access(content, fs.constants.F_OK, (err) => {
        if (err) {
          res.writeHead(404).end("File not found");
          return;
        }
        const html = `
          <html>
          <body>
            <h1>tails(watching): ${req.params?.id}</h1>
            <p><a href="/">back</a> - <a href="?download=true">download</a></p>
            <video width="600" controls>
              <source src="/stream/${req.params?.id}">
            </video>
          </body>
          </html>
        `;
        res.end(html);
      });
    },
  },
];
