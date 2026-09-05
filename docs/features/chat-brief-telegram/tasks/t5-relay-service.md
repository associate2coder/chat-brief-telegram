---
id: T5
title: "Implement the relay orchestration service (auth -> validate -> deliver -> shape response)"
layer: "app"
deps: ["T2", "T3", "T4"]
acs: ["AC-01", "AC-02", "AC-03", "AC-04", "AC-05"]
files_hint: ["src/relay/"]
owner: "olatsko@gmail.com"
estimate: "M"
status: "todo"
---

# T5 — Implement the relay orchestration service (auth -> validate -> deliver -> shape response)

## Why

This is [sad.md §6](../sad.md)'s three flows made concrete: the one use-case that ties the
secret check ([T4](./t4-secret-check.md)), the summary check ([T3](./t3-summary-validation.md)),
and the Telegram client ([T2](./t2-telegram-client.md)) into the outcome
[ADR-0002](../adr/0002-always-return-http-200-with-a-result-envelope.md) shapes.

## What

Add the relay service in `src/relay/index.ts`: check the secret first (reject with `unauthorized`
before looking at the summary at all, per AC-03's ordering requirement), then validate the
summary, then call the Telegram client, then map its result to `{ status: "sent" }` or
`{ error: "<reason>" }` (chat-not-started gets its own wording per AC-05; any other Telegram
outcome, including a timeout, gets the generic wording per AC-02).

## Definition of Done

- [ ] Unit test (faked Telegram client): wrong/missing secret -> `{ error: "unauthorized" }`,
      regardless of what the summary contains.
- [ ] Unit test: valid secret + empty/whitespace summary -> `{ error: "summary must not be
      empty" }`.
- [ ] Unit test: valid secret + summary + Telegram `delivered` -> `{ status: "sent" }`.
- [ ] Unit test: valid secret + summary + Telegram `chat_not_started` -> the AC-05-specific
      wording.
- [ ] Unit test: valid secret + summary + Telegram `failed` (incl. timeout) -> the generic AC-02
      wording.
- [ ] Unit test: the Telegram client is never called when the secret or summary check fails.
- [ ] lint + vet clean.

## Notes

Shares `src/relay/` with [T3](./t3-summary-validation.md) and [T4](./t4-secret-check.md) —
`implement` lane-serializes all three onto one gate/commit sequence.
