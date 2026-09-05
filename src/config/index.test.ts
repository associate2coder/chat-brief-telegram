import { describe, expect, it } from "vitest";
import { loadConfig } from "./index";

const baseEnv = {
  TELEGRAM_BOT_TOKEN: "test-bot-token",
  TELEGRAM_CHAT_ID: "12345",
  CHAT_BRIEF_SHARED_SECRET: "gpt.owner@example.test",
  PORT: "4000",
};

describe("loadConfig", () => {
  it("reads a complete environment into a Config", () => {
    const config = loadConfig(baseEnv);

    expect(config).toEqual({
      botToken: "test-bot-token",
      chatId: "12345",
      sharedSecret: "gpt.owner@example.test",
      port: 4000,
      telegramTimeoutMs: 5000,
    });
  });

  it("defaults the port and Telegram timeout when unset", () => {
    const config = loadConfig({ ...baseEnv, PORT: undefined });

    expect(config.port).toBe(3000);
    expect(config.telegramTimeoutMs).toBe(5000);
  });

  it("fails closed when the shared secret is missing", () => {
    expect(() =>
      loadConfig({ ...baseEnv, CHAT_BRIEF_SHARED_SECRET: undefined }),
    ).toThrow(/CHAT_BRIEF_SHARED_SECRET/);
  });

  it("fails closed when the shared secret is an empty string", () => {
    expect(() =>
      loadConfig({ ...baseEnv, CHAT_BRIEF_SHARED_SECRET: "" }),
    ).toThrow(/CHAT_BRIEF_SHARED_SECRET/);
  });

  it("fails closed when the bot token is missing (spec §6.1: required config incomplete)", () => {
    expect(() =>
      loadConfig({ ...baseEnv, TELEGRAM_BOT_TOKEN: undefined }),
    ).toThrow(/TELEGRAM_BOT_TOKEN/);
  });

  it("fails closed when the chat id is missing (spec §6.1: required config incomplete)", () => {
    expect(() =>
      loadConfig({ ...baseEnv, TELEGRAM_CHAT_ID: undefined }),
    ).toThrow(/TELEGRAM_CHAT_ID/);
  });
});
