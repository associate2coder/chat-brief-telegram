---
id: T7
title: "Add the end-to-end integration test against a faked Telegram API"
layer: "tests"
deps: ["T6"]
acs: ["AC-01", "AC-03"]
files_hint: ["src/app.integration.test.ts"]
owner: "olatsko@gmail.com"
estimate: "M"
status: "todo"
---

# T7 — Add the end-to-end integration test against a faked Telegram API

## Why

[sad.md §10 QG-1](../sad.md) and [spec §6 NFR](../spec.md) require the p95 latency budget and the
5000 ms Telegram timeout to be verified end-to-end, not just unit-tested per module —
`docs/architecture-map.md`'s own Tests convention names exactly this one integration test.

## What

One test file driving a real HTTP request through the built app to a faked Telegram API (no live
network calls) and back, per the convention in `docs/architecture-map.md`.

## Definition of Done

- [ ] Test: the happy-path round trip (valid secret + summary, faked Telegram responds quickly)
      completes within the spec's p95 ≤ 3000 ms budget.
- [ ] Test: a faked Telegram response that hangs is treated as a delivery failure once the
      5000 ms timeout elapses, not an unbounded wait.
- [ ] Test: a request with a wrong shared secret never results in a call reaching the faked
      Telegram API at all.
- [ ] lint + vet clean.

## Notes

This is the one cross-module integration test `docs/architecture-map.md` names — everything else
in the epic is unit-level with a faked collaborator.
