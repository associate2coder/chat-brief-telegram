---
id: T4
title: "Implement shared-secret authorization check (fail-closed)"
layer: "domain"
deps: ["T1"]
acs: ["AC-03"]
files_hint: ["src/relay/"]
owner: "olatsko@gmail.com"
estimate: "S"
status: "todo"
---

# T4 — Implement shared-secret authorization check (fail-closed)

## Why

[spec AC-03](../spec.md) / [ADR-0001](../adr/0001-authenticate-via-a-custom-shared-secret-header.md):
a wrong or missing secret must be denied "without revealing whether the summary itself was
otherwise valid" — this check must be independent of, and precede, summary validation.

## What

Add a pure authorization function in `src/relay/` (e.g. `isAuthorized(providedSecret,
configuredSecret)`) — no I/O. Must never treat an unset/empty configured secret as a match
(fail closed, per [spec §6.1](../spec.md) and [T1](./t1-load-config.md)'s own fail-closed
loading).

## Definition of Done

- [ ] Unit test: the correct secret passes.
- [ ] Unit test: a wrong secret is rejected.
- [ ] Unit test: a missing/undefined provided secret is rejected.
- [ ] Unit test: an empty configured secret always rejects (never a default-valid match), even if
      the provided secret is also empty.
- [ ] lint + vet clean.

## Notes

Shares `src/relay/` with [T3](./t3-summary-validation.md) and [T5](./t5-relay-service.md). No
dependency on T3 — can run in either order once T1 lands.
