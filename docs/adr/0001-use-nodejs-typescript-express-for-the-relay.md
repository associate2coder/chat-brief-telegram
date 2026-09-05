---
status: Accepted
owner: "olatsko@gmail.com"
reviewers: []
updated_at: "2026-09-05"
feature_size: "N/A — repo-level foundation decision, not tied to one feature"
ticket: "docs/idea-brief.md"
---

# 0001 — Use Node.js + TypeScript + Express for the relay service

- **Status:** Accepted
- **Date:** 2026-09-05
- **Deciders:** olatsko@gmail.com (owner), during the `survey` greenfield foundation session

## Context

The repo is empty. Before anything can be scaffolded, the project needs a language/runtime and an
HTTP framework for the one endpoint `chat-brief-telegram` needs: receive a POST from a Custom GPT
Action, check a shared secret, forward the message to Telegram's Bot API.

## Decision drivers

- The idea brief (`docs/idea-brief.md` §7) frames this explicitly as a learning project — the
  owner wants to understand the complete flow end to end, so ecosystem maturity and documentation
  density matter more than raw performance.
- The service is intentionally tiny (one route, no database) — the framework only needs to route
  one POST and read headers/body, nothing more.
- Easy to deploy as a small always-on process (see ADR-0003) on a free/cheap host.

## Considered options

1. **Node.js + TypeScript + Express** — mainstream, minimal boilerplate for one route, huge
   ecosystem of Telegram Bot API wrapper libraries, TypeScript catches payload-shape mistakes early.
2. **Python** — also a strong fit, simple micro-frameworks and first-class Telegram libraries
   available; viable if the owner already knew Python best.
3. **Go** — compiles to a single static binary, trivial to deploy anywhere with no runtime
   dependency, but more ceremony to write for a one-route relay.

## Decision outcome

**Chosen:** Option 1 (Node.js + TypeScript + Express). The owner already has Node/TypeScript in
mind, Express needs almost no boilerplate for a single route, and the ecosystem's Telegram Bot API
wrappers and HTTP-testing tools shorten the path to a working, well-understood integration —
matching the project's explicit learning goal.

## Consequences

**Positive**
- Minimal code to read end-to-end in one sitting — supports the learning goal.
- Large ecosystem of examples/wrappers for both the Custom GPT Action side and the Telegram side.
- TypeScript's static types catch a malformed request body before it reaches the Telegram client.

**Negative**
- Node introduces a runtime + dependency tree to keep patched, versus Go's single static binary.
- TypeScript adds a build step (`tsc`) that a plain JavaScript version wouldn't need.

**Neutral**
- Switching language later is possible (the service is a single small route) but would mean a
  rewrite, not a migration — acceptable given the project's small scope.

## Links

- Spec: [[../idea-brief.md]]
- SAD: N/A — no feature-level SAD yet, this is a repo-level foundation ADR
- Related ADR: [[0002-no-database-in-v1.md]], [[0003-deploy-as-an-always-on-process.md]]
