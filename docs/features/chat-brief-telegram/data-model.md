---
status: Draft
owner: "olatsko@gmail.com"
reviewers: []
updated_at: "2026-09-05"
feature_size: "S"
---

# Data model — chat-brief-telegram

<!-- N/A: this feature persists nothing. Confirmed by three independent sources, not just the
absence of a signal:
  - docs/architecture-map.md — `migration_tool: ""`, Datastores table: "None in v1 — see
    ADR-0002. A DB is an explicit future-scope item only if v1's usage justifies persistence."
  - docs/features/chat-brief-telegram/sad.md §4 — "Synchronous, in-process integration; no
    persistence, no cache, no queue"; §8 Crosscutting — "ID strategy | N/A — no persisted
    entities (project ADR-0002)".
  - docs/features/chat-brief-telegram/sad.md §6 — all three sequence diagrams (happy path,
    denied/rejected, Telegram-side outcomes) contain zero `writes/reads <entity>` persist notes;
    every step is either a direct call (HTTP, Telegram's `sendMessage`) or an in-memory check.
  - docs/features/chat-brief-telegram/spec.md §3 Non-goals — "A frontend or persisted send
    history — v1 is a stateless relay, no UI or database (idea-brief §5, ADR-0002)."

There are no aggregate roots to ask about, no PK/audit/delete-strategy conventions to confirm,
and no ER diagram to draw — the relay's only state is the request/response pair for the
duration of one HTTP call, held in memory and discarded. -->

## ER diagram

<!-- N/A: no entities. -->

## Entities

<!-- N/A: no entities. The relay's only "data" is the incoming request (summary + secret header)
and the outgoing response (`{ "status": "sent" }` or `{ "error": "<reason>" }`, per ADR-0002),
neither of which is stored anywhere past the single request/response cycle. -->

## Indexes

<!-- N/A: no tables, so no indexes. -->

## Test fixtures

<!-- N/A: no entities to build fixtures for. The one integration test (per
docs/architecture-map.md's Tests convention) fakes Telegram's Bot API response, not a database
row — that fixture belongs to the test-plan/implement stages, not this one. -->

## Migrations

**Zero migrations staged.** No `docs/features/chat-brief-telegram/migrations/` directory was
created — there is no schema change for this feature to produce, staged or otherwise. This is a
valid, complete outcome for a feature with no persistence (see the N/A note above), not a
skipped step.
