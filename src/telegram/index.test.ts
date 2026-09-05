import { describe, expect, it, vi } from "vitest";
import { sendMessage } from "./index";

const clientConfig = { botToken: "test-token", chatId: "123", timeoutMs: 5000 };

function jsonResponse(ok: boolean, body: unknown) {
  return {
    ok,
    json: async () => body,
  } as Response;
}

describe("sendMessage", () => {
  it("resolves delivered on a successful Telegram response", async () => {
    const fakeFetch = vi.fn().mockResolvedValue(jsonResponse(true, { ok: true }));

    const result = await sendMessage(clientConfig, "hello", fakeFetch);

    expect(result).toBe("delivered");
    expect(fakeFetch).toHaveBeenCalledWith(
      expect.stringContaining("test-token"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("resolves chat_not_started when Telegram reports the bot can't initiate the conversation", async () => {
    const fakeFetch = vi.fn().mockResolvedValue(
      jsonResponse(false, {
        ok: false,
        error_code: 403,
        description: "Forbidden: bot can't initiate conversation with a user",
      }),
    );

    const result = await sendMessage(clientConfig, "hello", fakeFetch);

    expect(result).toBe("chat_not_started");
  });

  it("resolves failed for any other Telegram error response", async () => {
    const fakeFetch = vi.fn().mockResolvedValue(
      jsonResponse(false, { ok: false, error_code: 400, description: "Bad Request: message is too long" }),
    );

    const result = await sendMessage(clientConfig, "hello", fakeFetch);

    expect(result).toBe("failed");
  });

  it("resolves failed when the call does not respond within the configured timeout", async () => {
    const hangingFetch = vi.fn().mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
        }),
    );

    const result = await sendMessage(
      { ...clientConfig, timeoutMs: 10 },
      "hello",
      hangingFetch as unknown as typeof fetch,
    );

    expect(result).toBe("failed");
  });
});
