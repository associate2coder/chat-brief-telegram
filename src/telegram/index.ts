export type SendResult = "delivered" | "chat_not_started" | "failed";

export interface TelegramClientConfig {
  botToken: string;
  chatId: string;
  timeoutMs: number;
}

interface TelegramErrorBody {
  ok: false;
  error_code?: number;
  description?: string;
}

function isChatNotStartedError(body: unknown): boolean {
  const err = body as Partial<TelegramErrorBody>;
  const description = err.description ?? "";
  return (
    (err.error_code === 403 && /can't initiate conversation/i.test(description)) ||
    // Telegram's more common real-world response for a chat id the owner never started a
    // conversation with (sad.md §6 Flow 3 names both shapes) — review-2026-09-05 finding.
    (err.error_code === 400 && /chat not found/i.test(description))
  );
}

export async function sendMessage(
  config: TelegramClientConfig,
  text: string,
  fetchImpl: typeof fetch = fetch,
): Promise<SendResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const res = await fetchImpl(
      `https://api.telegram.org/bot${config.botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: config.chatId, text }),
        signal: controller.signal,
      },
    );

    if (res.ok) {
      return "delivered";
    }

    const body = await res.json().catch(() => ({}));
    return isChatNotStartedError(body) ? "chat_not_started" : "failed";
  } catch {
    return "failed";
  } finally {
    clearTimeout(timer);
  }
}
