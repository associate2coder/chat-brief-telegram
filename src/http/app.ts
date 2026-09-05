import express, { Express, Request, Response } from "express";
import type { RelayRequest, RelayResult } from "../relay";

export type SendHandler = (request: RelayRequest) => Promise<RelayResult>;

// Express's own default (used explicitly so the value driving the 413/oversized path below is
// visible here, not buried in a library default).
const MAX_BODY_BYTES = 100 * 1024;

export function createApp(sendHandler: SendHandler): Express {
  const app = express();
  const parseJson = express.json({ limit: MAX_BODY_BYTES });

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Body parsing runs inside the route (via its own callback) rather than as app-level
  // middleware, so a parse failure (malformed JSON, oversized body) never reaches Express's
  // default error handler — which would answer with a raw non-JSON error page and a stack
  // trace (review-2026-09-05 finding). Instead it's handed to the relay as `bodyError`, so the
  // shared-secret check still runs first (spec §6.1) before any body-parse detail is revealed.
  app.post("/api/v1/send", (req: Request, res: Response) => {
    parseJson(req, res, async (err: unknown) => {
      try {
        const providedSecret = req.header("X-Chat-Brief-Secret") ?? undefined;

        if (err) {
          const bodyError =
            err instanceof SyntaxError
              ? "request body must be valid JSON"
              : "request body too large or invalid";
          const result = await sendHandler({ summary: undefined, providedSecret, bodyError });
          res.status(200).json(result);
          return;
        }

        const body = req.body as { summary?: unknown } | undefined;
        const result = await sendHandler({ summary: body?.summary, providedSecret });
        res.status(200).json(result);
      } catch {
        // Never leak an unexpected exception's message (it could echo the secret or the bot
        // token if it originated deep in the call chain) — spec §6.1.
        res.status(200).json({ error: "internal error" });
      }
    });
  });

  return app;
}
