import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "./app";
import type { RelayRequest, RelayResult } from "../relay";

describe("app boots", () => {
  it("responds to a health check", async () => {
    const app = createApp(async () => ({ status: "sent" }));

    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("POST /api/v1/send", () => {
  it("returns 200 { status: sent } for a correct secret and valid summary", async () => {
    const sendHandler = vi
      .fn<[RelayRequest], Promise<RelayResult>>()
      .mockResolvedValue({ status: "sent" });
    const app = createApp(sendHandler);

    const res = await request(app)
      .post("/api/v1/send")
      .set("X-Chat-Brief-Secret", "correct-secret")
      .send({ summary: "the takeaway" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "sent" });
    expect(sendHandler).toHaveBeenCalledWith({
      summary: "the takeaway",
      providedSecret: "correct-secret",
    });
  });

  it("returns 200 { error } for a missing/wrong secret, never a non-2xx status", async () => {
    const sendHandler = vi
      .fn<[RelayRequest], Promise<RelayResult>>()
      .mockResolvedValue({ error: "unauthorized" });
    const app = createApp(sendHandler);

    const res = await request(app)
      .post("/api/v1/send")
      .send({ summary: "the takeaway" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ error: "unauthorized" });
    expect(sendHandler).toHaveBeenCalledWith({
      summary: "the takeaway",
      providedSecret: undefined,
    });
  });

  it("returns 200 { error } for a malformed JSON body, never a 500 or a raw exception", async () => {
    const sendHandler = vi
      .fn<[RelayRequest], Promise<RelayResult>>()
      .mockResolvedValue({ error: "request body must be valid JSON" });
    const app = createApp(sendHandler);

    const res = await request(app)
      .post("/api/v1/send")
      .set("X-Chat-Brief-Secret", "correct-secret")
      .set("Content-Type", "application/json")
      .send("{not valid json");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ error: "request body must be valid JSON" });
    // The parse failure is handed to the relay as `bodyError` rather than short-circuited here,
    // so the shared-secret check still runs first (spec §6.1) — review-2026-09-05 finding.
    expect(sendHandler).toHaveBeenCalledWith({
      summary: undefined,
      providedSecret: "correct-secret",
      bodyError: "request body must be valid JSON",
    });
  });

  it("returns 200 { error } for an oversized body, never a raw error page (review-2026-09-05 finding)", async () => {
    const sendHandler = vi
      .fn<[RelayRequest], Promise<RelayResult>>()
      .mockResolvedValue({ error: "request body too large or invalid" });
    const app = createApp(sendHandler);

    const oversized = JSON.stringify({ summary: "x".repeat(200 * 1024) });

    const res = await request(app)
      .post("/api/v1/send")
      .set("X-Chat-Brief-Secret", "correct-secret")
      .set("Content-Type", "application/json")
      .send(oversized);

    expect(res.status).toBe(200);
    expect(res.type).toBe("application/json");
    expect(res.body).toEqual({ error: "request body too large or invalid" });
    expect(sendHandler).toHaveBeenCalledWith({
      summary: undefined,
      providedSecret: "correct-secret",
      bodyError: "request body too large or invalid",
    });
  });

  it("never lets an unexpected exception leak the secret or the bot token", async () => {
    const secret = "correct-secret";
    const botToken = "super-secret-bot-token";
    const sendHandler = vi.fn<[RelayRequest], Promise<RelayResult>>().mockImplementation(() => {
      throw new Error(`boom while using token ${botToken} and secret ${secret}`);
    });
    const app = createApp(sendHandler);

    const res = await request(app)
      .post("/api/v1/send")
      .set("X-Chat-Brief-Secret", secret)
      .send({ summary: "the takeaway" });

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain(secret);
    expect(JSON.stringify(res.body)).not.toContain(botToken);
  });
});
