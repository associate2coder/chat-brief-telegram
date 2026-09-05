import type { Config } from "../config";
import { sendMessage as defaultSendMessage } from "../telegram";
import { isAuthorized } from "./auth";
import { isValidSummary } from "./validation";

export interface RelayRequest {
  summary: unknown;
  providedSecret: string | undefined;
  // Set by the http layer when the request body itself couldn't be parsed (malformed JSON,
  // oversized payload). Carried through rather than short-circuited in http/ so the shared
  // secret is still checked first (spec §6.1) — an unauthorized caller must never learn
  // whether its body parsed, only that it's denied.
  bodyError?: string;
}

export type RelayResult = { status: "sent" } | { error: string };

export async function handleSend(
  request: RelayRequest,
  config: Config,
  sendMessageImpl: typeof defaultSendMessage = defaultSendMessage,
): Promise<RelayResult> {
  if (!isAuthorized(request.providedSecret, config.sharedSecret)) {
    return { error: "unauthorized" };
  }

  if (request.bodyError !== undefined) {
    return { error: request.bodyError };
  }

  if (!isValidSummary(request.summary)) {
    return { error: "summary must not be empty" };
  }

  const outcome = await sendMessageImpl(
    {
      botToken: config.botToken,
      chatId: config.chatId,
      timeoutMs: config.telegramTimeoutMs,
    },
    request.summary,
  );

  if (outcome === "delivered") {
    return { status: "sent" };
  }

  if (outcome === "chat_not_started") {
    return { error: "start a conversation with your Telegram bot first" };
  }

  return { error: "could not deliver the message to Telegram" };
}
