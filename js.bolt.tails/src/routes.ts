import { IncomingMessage, ServerResponse } from "http";
import { ParamsIncomingMessage } from "@slack/bolt/dist/receivers/ParamsIncomingMessage";

// Maintenance notes
// * URL queries are challenging to parse
// * req.params might be undefined
// * importing ParamsIncomingMessage type is tedious

export default [
  {
    path: "/health", // http://localhost:3000/health
    method: ["GET"],
    handler: (
      req: ParamsIncomingMessage,
      res: ServerResponse<IncomingMessage>,
    ) => {
      console.log("Someone just checked in – hope things are well.");
      console.log(req.headers);
      res.writeHead(200);
      res.end(`Things are going just fine at ${req.headers.host}`);
    },
  },
  {
    path: "/channel", // http://localhost:3000/channel?name=music
    method: ["GET"],
    handler: (
      req: ParamsIncomingMessage,
      res: ServerResponse<IncomingMessage>,
    ) => {
      let urlParams: URLSearchParams = new URLSearchParams();
      const params = req.url?.split("?");
      if (params && params.length > 1) {
        urlParams = new URLSearchParams(params[1]);
      }

      const channelName = urlParams.get("name");
      res.writeHead(200);
      res.end(`Welcome to #${channelName ?? "general"}!`);
    },
  },
  {
    path: "/music/jazz", // http://localhost:3000/music/jazz
    method: ["GET"],
    handler: (
      _req: ParamsIncomingMessage,
      res: ServerResponse<IncomingMessage>,
    ) => {
      res.writeHead(200);
      res.end("Play it cool, you cat.");
    },
  },
  {
    path: "/music/:genre", // http://localhost:3000/music/pastoral
    method: ["GET"],
    handler: (
      req: ParamsIncomingMessage,
      res: ServerResponse<IncomingMessage>,
    ) => {
      res.writeHead(200);
      res.end(`Oh? ${req.params?.genre}? That slaps!`);
    },
  },
];
