---
status: Accepted
owner: "olatsko@gmail.com"
reviewers: []
updated_at: "2026-09-05"
feature_size: "N/A — repo-level foundation decision, not tied to one feature"
ticket: "docs/idea-brief.md"
---

# 0002 — Ship v1 with no database or persistence layer

- **Status:** Accepted
- **Date:** 2026-09-05
- **Deciders:** olatsko@gmail.com (owner), during the `survey` greenfield foundation session

## Context

The idea brief (`docs/idea-brief.md` §5 Out of scope) already rules out a database for v1: "no
frontend, no database... focus on building and understanding the complete flow." This ADR fixes
that as the architectural foundation so later stages (`data-model`, `implement`) don't silently
introduce persistence.

## Decision drivers

- Explicit v1 scope boundary in the idea brief: intentionally simple, single-owner tool.
- The failure-mode research run during `specify`'s ideation pass flagged that the lack of
  persistence is itself the weakest spot (a failed/lost send leaves no trace) — an accepted,
  named risk rather than an oversight.
- No multi-user, no history requirement in v1 — nothing to store yet.

## Considered options

1. **No database — stateless relay** — every request is handled and forgotten; the only state is
   the environment variables (bot token, chat id, shared secret).
2. **A lightweight embedded store for a send history/audit trail** — would close the "phantom
   success" and "no evidence of failure" gaps the devil's-advocate pass found, at the cost of the
   "no database" simplicity goal the owner explicitly asked for in v1.
3. **A full relational database with multi-user support** — supports the later multi-user
   direction but is scope far beyond what v1 needs or the owner asked for.

## Decision outcome

**Chosen:** Option 1 (no database). The idea brief is explicit and the owner's stated goal for v1
is learning the complete flow with minimum moving parts, not building a durable audit trail. The
risk this accepts (no evidence of a failed or lost send) is named plainly rather than silently
absorbed — see the architecture map's Constraints section and the spec's Risks.

## Consequences

**Positive**
- Nothing to provision, migrate, or back up — the entire v1 build stays learnable in one sitting.
- No new failure surface (a database being unreachable, migrations drifting, etc.).

**Negative**
- A failed or lost Telegram send leaves no trace anywhere outside that single conversation turn —
  named explicitly as the weakest spot in the idea brief and confirmed by the failure-mode research.
- No way to answer "how many sends happened, how many failed" without it — acceptable for a
  single-user learning tool, revisited if usage or the multi-user extension ever materializes.

**Neutral**
- Adding persistence later (e.g. a simple send-history log) is a additive change, not a rewrite —
  the relay's current shape doesn't block it.

## Links

- Spec: [[../idea-brief.md]]
- SAD: N/A — no feature-level SAD yet, this is a repo-level foundation ADR
- Related ADR: [[0001-use-nodejs-typescript-express-for-the-relay.md]]
