---
status: Accepted
owner: "olatsko@gmail.com"
reviewers: []
updated_at: "2026-09-05"
feature_size: "S"
ticket: "chat-brief-telegram"
---

# 0001 — Authenticate via a custom shared-secret header

- **Status:** Accepted
- **Date:** 2026-09-05
- **Deciders:** Architect (olatsko@gmail.com), during the `design` Socratic walk

## Context

The relay has exactly one authz boundary: the shared secret that distinguishes the owner's
configured Custom GPT Action from anyone else who finds the relay's address (spec AC-03). The
secret must travel as request metadata, never in the URL (spec §6.1), and must never be confused
with the Telegram bot token — CONTEXT.md's glossary names this exact confusion as the way the bot
token could leak. This decision fixes which HTTP mechanism carries the secret on every call.

## Decision drivers

- AC-03 — a caller without the correct secret must be denied, nothing sent, no hint about the
  summary's own validity.
- Spec §6.1 Transport — the secret must be sent as request metadata, never embedded in the URL.
- CONTEXT.md glossary — the shared secret and the Telegram bot token are deliberately distinct
  credentials; the mechanism should not blur that line.
- The secret's value is a single, hand-set, non-expiring string (an email-shaped value chosen by
  the owner, loaded from an environment variable) — not an issued, refreshable token.

## Considered options

1. **Custom header (`X-Chat-Brief-Secret`)** — a bespoke header name the relay checks against the
   configured value.
2. **Standard `Authorization: Bearer <secret>` header** — reuses the conventional bearer-token
   header shape.

## Decision outcome

**Chosen:** Option 1, a custom header (`X-Chat-Brief-Secret`). It keeps the shared secret visibly
distinct from both the Telegram bot token and from OAuth-style bearer semantics that don't apply
here — there is no token issuance, expiry, or refresh, just one fixed value the owner rotates by
hand. OpenAI's Custom GPT Actions support a custom header name natively via their "API Key" auth
type, so this is a supported configuration, not a workaround.

## Consequences

**Positive**
- The header name itself signals "this is chat-brief-telegram's own secret," reducing the chance
  of a future maintainer conflating it with the bot token or assuming a bearer-token lifecycle.
- No dependency on any Bearer-token tooling or semantics the relay doesn't actually implement.

**Negative**
- The owner must type the exact header name into the Custom GPT Action's auth configuration by
  hand; a typo there fails silently from the Action's side (the relay just sees a missing header
  and denies per AC-03).

**Neutral**
- Switching to `Authorization: Bearer` later is possible but requires reconfiguring the Custom GPT
  Action and updating the `api` stage's OpenAPI security scheme — a same-day change, not a
  migration.

**Accepted risk (from spec §6.1, unchanged by this ADR):** the secret's value is an email-shaped
string rather than a high-entropy random token; brute-forcing it is an explicitly accepted risk in
v1 (no lockout or alerting) — this decision doesn't add to or reduce that risk, since either header
mechanism carries the same value verbatim.

## Links

- Spec: [[../spec.md]] AC-03, §6.1
- SAD: [[../sad.md]] §4
- Related ADR: [[0002-always-return-http-200-with-a-result-envelope]]
