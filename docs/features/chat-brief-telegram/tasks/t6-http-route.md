---
id: T6
title: "Add the POST /api/v1/send route and wire config -> telegram -> relay -> http"
layer: "ports"
deps: ["T5"]
acs: ["AC-01", "AC-02", "AC-03", "AC-04", "AC-05"]
files_hint: ["src/http/", "src/index.ts"]
owner: "olatsko@gmail.com"
estimate: "M"
status: "todo"
---

# T6 — Add the POST /api/v1/send route and wire config -> telegram -> relay -> http

## Why

[contracts/openapi.yaml](../contracts/openapi.yaml)'s `sendSummaryToTelegram` operation is the
observable contract every acceptance criterion is ultimately checked against.

## What

Add the route to `src/http/app.ts`: read the `X-Chat-Brief-Secret` header + JSON body, call the
relay service ([T5](./t5-relay-service.md)), and always respond `200` with the
`SendSuccess`/`SendError` envelope — including on a malformed body or an unexpected exception,
which must be caught and turned into a generic `SendError`, never a raw stack trace or a response
containing the secret/bot token ([spec §6.1](../spec.md)). Update `src/index.ts` to construct and
wire config -> Telegram client -> relay service -> app, matching
[sad.md §5](../sad.md)'s `http -> relay -> telegram` direct wiring, no DI container.

## Definition of Done

- [ ] Integration test (via `supertest`, already a devDependency): correct header + valid summary
      returns `200 { status: "sent" }` against a faked relay/Telegram.
- [ ] Integration test: missing/wrong header returns `200 { error: "unauthorized" }`.
- [ ] Integration test: malformed JSON body returns `200 { error: "..." }`, never a 500 or a raw
      exception.
- [ ] Integration test: no response ever contains the shared secret or the Telegram bot token,
      even when an unexpected error is thrown mid-request.
- [ ] `npm run dev` boots and the route responds on the configured port.
- [ ] lint + vet clean.

## Notes

Touches both `src/http/` and `src/index.ts` — no other task shares this `files_hint`, so it can
run alone once T5 is green.
