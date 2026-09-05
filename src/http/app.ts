import express, { Express, NextFunction, Request, Response } from "express";
import type { RelayRequest, RelayResult } from "../relay";

export type SendHandler = (request: RelayRequest) => Promise<RelayResult>;

export function createApp(sendHandler: SendHandler): Express {
  const app = express();
  app.use(express.json());

  // Malformed JSON is thrown by express.json() before any route runs; catch it here so
  // every outcome — parse failure included — still answers 200 with the envelope (ADR-0002).
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError) {
      res.status(200).json({ error: "request body must be valid JSON" });
      return;
    }
    next(err);
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.post("/api/v1/send", async (req, res) => {
    try {
      const providedSecret = req.header("X-Chat-Brief-Secret") ?? undefined;
      const body = req.body as { summary?: unknown } | undefined;
      const result = await sendHandler({
        summary: body?.summary,
        providedSecret,
      });
      res.status(200).json(result);
    } catch {
      // Never leak an unexpected exception's message (it could echo the secret or the bot
      // token if it originated deep in the call chain) — spec §6.1.
      res.status(200).json({ error: "internal error" });
    }
  });

  return app;
}
