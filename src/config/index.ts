export interface Config {
  botToken: string;
  chatId: string;
  sharedSecret: string;
  port: number;
  telegramTimeoutMs: number;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const botToken = env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN is missing or empty — refusing to start with incomplete required config (spec §6.1)",
    );
  }

  const chatId = env.TELEGRAM_CHAT_ID;
  if (!chatId) {
    throw new Error(
      "TELEGRAM_CHAT_ID is missing or empty — refusing to start with incomplete required config (spec §6.1)",
    );
  }

  const sharedSecret = env.CHAT_BRIEF_SHARED_SECRET;
  if (!sharedSecret) {
    throw new Error(
      "CHAT_BRIEF_SHARED_SECRET is missing or empty — refusing to start rather than accepting every caller (spec §6.1)",
    );
  }

  return {
    botToken,
    chatId,
    sharedSecret,
    // PORT alone allows 0 — Node's own convention for "let the OS assign a free port",
    // already relied on by the integration test harness.
    port: parseNonNegativeInt("PORT", env.PORT, 3000, 0),
    telegramTimeoutMs: parseNonNegativeInt("TELEGRAM_TIMEOUT_MS", env.TELEGRAM_TIMEOUT_MS, 5000, 1),
  };
}

// A non-numeric or blank value silently coerces to NaN or 0 (Number("abc") === NaN,
// Number("") === 0), and NaN elsewhere in the app — e.g. setTimeout's delay — coerces again to
// near-0, causing every send to fail instantly with no diagnostic (review-2026-09-05 finding).
// Fail closed at boot instead, same as the three credential fields above.
function parseNonNegativeInt(
  name: string,
  value: string | undefined,
  fallback: number,
  minValue: number,
): number {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  if (value === "" || !Number.isInteger(parsed) || parsed < minValue) {
    throw new Error(
      `${name} must be an integer >= ${minValue} if set (got "${value}") — refusing to start with invalid config (spec §6.1)`,
    );
  }

  return parsed;
}
