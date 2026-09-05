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
    port: Number(env.PORT ?? 3000),
    telegramTimeoutMs: Number(env.TELEGRAM_TIMEOUT_MS ?? 5000),
  };
}
