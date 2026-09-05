---
status: Accepted
owner: "olatsko@gmail.com"
reviewers: []
updated_at: "2026-09-05"
feature_size: "N/A — repo-level foundation decision, not tied to one feature"
ticket: "docs/idea-brief.md"
---

# 0003 — Deploy the relay as a small always-on process, not a serverless function

- **Status:** Accepted
- **Date:** 2026-09-05
- **Deciders:** olatsko@gmail.com (owner), during the `survey` greenfield foundation session

## Context

While fixing the foundation, `specify`'s failure-mode research (running in parallel on the same
idea) surfaced a concrete production risk: a serverless function on a free tier "cold starts"
(sleeps, then takes 20-50s to wake) — long enough to exceed a Custom GPT Action's roughly 45s call
timeout. The first send of a session would appear to fail on the caller's side while the relay
completes the send anyway; a retry then double-delivers the same message to Telegram.

## Decision drivers

- The single acceptance-visible success metric for v1 is "the owner keeps using it" — a broken
  first-of-session experience directly threatens that metric.
- v1 has no database and no dedup/retry logic (ADR-0002) — nothing downstream would catch or
  collapse a double-send, so the hosting shape is the only lever available to prevent it.
- Usage is low-volume and bursty (a handful of sends a week) — exactly the pattern that maximizes
  exposure to cold starts on a scale-to-zero platform.

## Considered options

1. **A small always-on process** — a tiny long-running Node process on a low-cost always-on host;
   no cold start, so the first request of a session behaves identically to the hundredth.
2. **A serverless function, accepting the cold-start risk** — cheaper and simpler to deploy
   (true pay-per-use, scales to zero), but keeps the cold-start -> timeout -> double-send failure
   mode live for v1 without mitigation.

## Decision outcome

**Chosen:** Option 1 (always-on process). The cost difference is negligible for a single-user
tool, and it directly removes a failure mode that would otherwise need its own mitigation (a
request dedup mechanism) that v1's no-database, no-retry-queue scope (ADR-0002) deliberately
doesn't include.

## Consequences

**Positive**
- Removes the cold-start -> timeout -> double-send failure mode entirely, with no added code.
- Consistent latency regardless of how long the service has been idle.

**Negative**
- Slightly more operational surface than "true" serverless — something has to keep the process
  running (a restart policy, health check) even though usage is low.
- Marginally higher baseline cost than a function that scales fully to zero, though negligible for
  this scale.

**Neutral**
- Moving to serverless later is possible if usage patterns or hosting costs change, but would
  need the cold-start risk re-mitigated (e.g. a warm-up ping or a dedup layer) at that point.

## Links

- Spec: [[../idea-brief.md]]
- SAD: N/A — no feature-level SAD yet, this is a repo-level foundation ADR
- Related ADR: [[0001-use-nodejs-typescript-express-for-the-relay.md]], [[0002-no-database-in-v1.md]]
