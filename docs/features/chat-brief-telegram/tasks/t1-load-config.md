---
id: T1
title: "Load and validate relay configuration from environment variables"
layer: "infra"
deps: []
acs: ["AC-03"]
files_hint: ["src/config/"]
owner: "olatsko@gmail.com"
estimate: "S"
status: "todo"
---

# T1 — Load and validate relay configuration from environment variables

## Why

The shared secret's issuance/rotation decision ([sad.md §4](../sad.md)) is env-var-only, and
[spec §6.1](../spec.md) requires the relay to fail closed rather than treat an unset/empty
configured secret as a valid match. Every other task depends on `Config` existing first.

## What

Extend `src/config/index.ts`'s `Config` interface + `loadConfig()` to read, beyond the existing
`port`: the Telegram bot token, the destination chat id, the shared secret, and the Telegram
call timeout (5000 ms per [spec §6 NFR](../spec.md)). No hardcoded values, no defaults for the
secret.

## Definition of Done

- [ ] Unit test: a complete environment produces a `Config` with all fields populated.
- [ ] Unit test: a missing or empty shared secret causes config loading to fail closed (throws /
      refuses to produce a usable config) — never silently valid.
- [ ] lint + vet clean.

## Notes

Shares `src/config/` with no other task's `files_hint`, so it isn't lane-serialized against
anything — safe to start immediately, in parallel with [T3](./t3-summary-validation.md).
