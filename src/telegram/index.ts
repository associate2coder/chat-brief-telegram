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
  return (
    err.error_code === 403 &&
    /can't initiate conversation/i.test(err.description ?? "")
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
