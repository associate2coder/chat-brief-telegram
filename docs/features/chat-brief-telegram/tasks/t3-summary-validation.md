---
id: T3
title: "Implement summary validation (reject empty, whitespace-only, or non-text input)"
layer: "domain"
deps: []
acs: ["AC-04"]
files_hint: ["src/relay/"]
owner: "olatsko@gmail.com"
estimate: "S"
status: "todo"
---

# T3 — Implement summary validation (reject empty, whitespace-only, or non-text input)

## Why

[spec AC-04](../spec.md) requires the relay to treat a zero-length, whitespace-only, or
missing/non-text summary all the same way: rejected, nothing sent, told the summary must not be
empty.

## What

Add a pure validation function in `src/relay/` (e.g. `isValidSummary`) — no I/O, no dependency on
`Config` or the Telegram client. Matches the same rule `contracts/openapi.yaml`'s `SendRequest`
schema encodes (`minLength: 1` + a non-whitespace pattern), so the two stay in agreement.

## Definition of Done

- [ ] Unit test: a non-empty string with visible characters passes.
- [ ] Unit test: an empty string is rejected.
- [ ] Unit test: a whitespace-only string is rejected.
- [ ] Unit test: a missing or non-string value is rejected.
- [ ] lint + vet clean.

## Notes

Shares `src/relay/` with [T4](./t4-secret-check.md) and [T5](./t5-relay-service.md) — no
dependency between T3 and T4, but `implement` will lane-serialize work on this directory. Safe
to start immediately, in parallel with [T1](./t1-load-config.md).
