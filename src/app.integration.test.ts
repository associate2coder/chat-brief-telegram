import { afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "./http/app";
import { handleSend } from "./relay";
import { loadConfig } from "./config";

const testEnv = {
  TELEGRAM_BOT_TOKEN: "bot-token",
  TELEGRAM_CHAT_ID: "123",
  CHAT_BRIEF_SHARED_SECRET: "correct-secret",
  PORT: "0",
};

function buildApp(overrides: Partial<ReturnType<typeof loadConfig>> = {}) {
  const config = { ...loadConfig(testEnv), ...overrides };
  return createApp((req) => handleSend(req, config));
}

describe("end-to-end: request -> relay -> faked Telegram API -> response", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("completes the happy-path round trip within the spec's p95 budget (<= 3000ms)", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    const app = buildApp();
    const start = Date.now();

    const res = await request(app)
      .post("/api/v1/send")
      .set("X-Chat-Brief-Secret", "correct-secret")
      .send({ summary: "the takeaway" });

    const elapsedMs = Date.now() - start;

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "sent" });
    expect(elapsedMs).toBeLessThanOrEqual(3000);
  });

  it("treats a hanging Telegram response as a delivery failure once the timeout elapses, not an unbounded wait", async () => {
    // The 5000ms production default is unit-tested in src/config/index.test.ts. Waiting out a
    // real 5s here would just slow the suite down for no extra coverage, so this test proves
    // the same bounded-wait *mechanism* (AbortController fires -> "failed", nothing hangs
    // forever) at a short real timeout instead of faking time — fake timers don't mix
    // reliably with supertest's real socket I/O (see the BAD-red note in the task history).
    vi.spyOn(global, "fetch").mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          const signal = (init as RequestInit | undefined)?.signal;
          signal?.addEventListener("abort", () =>
            reject(new DOMException("aborted", "AbortError")),
          );
        }),
    );

    const app = buildApp({ telegramTimeoutMs: 50 });
    const start = Date.now();

    const res = await request(app)
      .post("/api/v1/send")
      .set("X-Chat-Brief-Secret", "correct-secret")
      .send({ summary: "the takeaway" });

    const elapsedMs = Date.now() - start;

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      error: "could not deliver the message to Telegram",
    });
    // Bounded: resolves shortly after the configured timeout, not left hanging indefinitely.
    expect(elapsedMs).toBeLessThan(1000);
  });

  it("never lets a call reach the faked Telegram API when the shared secret is wrong", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");

    const app = buildApp();
    const res = await request(app)
      .post("/api/v1/send")
      .set("X-Chat-Brief-Secret", "wrong-secret")
      .send({ summary: "the takeaway" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ error: "unauthorized" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns the always-200 JSON envelope for an oversized body, never a raw error page (review-2026-09-05 finding)", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");

    const app = buildApp();
    const oversized = JSON.stringify({ summary: "x".repeat(200 * 1024) });

    const res = await request(app)
      .post("/api/v1/send")
      .set("X-Chat-Brief-Secret", "correct-secret")
      .set("Content-Type", "application/json")
      .send(oversized);

    expect(res.status).toBe(200);
    expect(res.type).toBe("application/json");
    expect(res.body).toEqual({ error: "request body too large or invalid" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("reports unauthorized for a wrong secret even when the body is also malformed, never the parse error", async () => {
    const app = buildApp();

    const res = await request(app)
      .post("/api/v1/send")
      .set("X-Chat-Brief-Secret", "wrong-secret")
      .set("Content-Type", "application/json")
      .send("{not valid json");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ error: "unauthorized" });
  });
});
