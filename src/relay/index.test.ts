import { describe, expect, it, vi } from "vitest";
import { handleSend } from "./index";
import type { Config } from "../config";

const config: Config = {
  botToken: "bot-token",
  chatId: "123",
  sharedSecret: "correct-secret",
  port: 3000,
  telegramTimeoutMs: 5000,
};

describe("handleSend", () => {
  it("rejects a wrong secret as unauthorized, regardless of the summary", async () => {
    const fakeSend = vi.fn();

    const result = await handleSend(
      { summary: "", providedSecret: "wrong" },
      config,
      fakeSend,
    );

    expect(result).toEqual({ error: "unauthorized" });
    expect(fakeSend).not.toHaveBeenCalled();
  });

  it("rejects a missing secret as unauthorized even with a valid summary", async () => {
    const fakeSend = vi.fn();

    const result = await handleSend(
      { summary: "a valid summary", providedSecret: undefined },
      config,
      fakeSend,
    );

    expect(result).toEqual({ error: "unauthorized" });
    expect(fakeSend).not.toHaveBeenCalled();
  });

  it("rejects an empty summary once the secret is valid", async () => {
    const fakeSend = vi.fn();

    const result = await handleSend(
      { summary: "   ", providedSecret: "correct-secret" },
      config,
      fakeSend,
    );

    expect(result).toEqual({ error: "summary must not be empty" });
    expect(fakeSend).not.toHaveBeenCalled();
  });

  it("returns sent when Telegram delivers", async () => {
    const fakeSend = vi.fn().mockResolvedValue("delivered");

    const result = await handleSend(
      { summary: "the takeaway", providedSecret: "correct-secret" },
      config,
      fakeSend,
    );

    expect(result).toEqual({ status: "sent" });
    expect(fakeSend).toHaveBeenCalledWith(
      { botToken: "bot-token", chatId: "123", timeoutMs: 5000 },
      "the takeaway",
    );
  });

  it("returns the AC-05-specific wording when the owner never started a chat with the bot", async () => {
    const fakeSend = vi.fn().mockResolvedValue("chat_not_started");

    const result = await handleSend(
      { summary: "the takeaway", providedSecret: "correct-secret" },
      config,
      fakeSend,
    );

    expect(result).toEqual({
      error: "start a conversation with your Telegram bot first",
    });
  });

  it("returns the generic wording for any other Telegram failure (incl. timeout)", async () => {
    const fakeSend = vi.fn().mockResolvedValue("failed");

    const result = await handleSend(
      { summary: "the takeaway", providedSecret: "correct-secret" },
      config,
      fakeSend,
    );

    expect(result).toEqual({
      error: "could not deliver the message to Telegram",
    });
  });
});
