---
id: T2
title: "Implement the Telegram sendMessage client wrapper with a bounded timeout"
layer: "infra"
deps: ["T1"]
acs: ["AC-02", "AC-05"]
files_hint: ["src/telegram/"]
owner: "olatsko@gmail.com"
estimate: "M"
status: "todo"
---

# T2 — Implement the Telegram sendMessage client wrapper with a bounded timeout

## Why

[sad.md §6 Flow 3](../sad.md) needs the client to distinguish three outcomes: delivered, the
owner never started a chat with the bot (AC-05's distinct wording), and any other Telegram
failure including a timeout (spec §6 NFR: wait at most 5000 ms, never unbounded).

## What

Implement `src/telegram/index.ts`'s `sendMessage` wrapper over Telegram's Bot API, taking the
bot token, chat id, and timeout from `Config` ([T1](./t1-load-config.md)). Return a discriminated
result (e.g. `delivered` / `chat_not_started` / `failed`) rather than throwing, so the caller
([T5](./t5-relay-service.md)) can map each case to its own wording without parsing exceptions.

## Definition of Done

- [ ] Unit test (faked HTTP layer): a successful Telegram response resolves `delivered`.
- [ ] Unit test: a Telegram "chat not found / can't initiate" response resolves
      `chat_not_started`, distinct from the generic failure.
- [ ] Unit test: any other Telegram error response resolves `failed`.
- [ ] Unit test: a request that doesn't respond within the configured timeout resolves `failed`
      via a timeout, not an unbounded wait.
- [ ] lint + vet clean.

## Notes

No live network call in tests — fake the HTTP layer (`fetch` mock or an injected client).
