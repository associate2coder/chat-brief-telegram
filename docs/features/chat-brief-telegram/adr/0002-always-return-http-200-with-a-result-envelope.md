---
status: Accepted
owner: "olatsko@gmail.com"
reviewers: []
updated_at: "2026-09-05"
feature_size: "S"
ticket: "chat-brief-telegram"
---

# 0002 — Always return HTTP 200 with a result envelope

- **Status:** Accepted
- **Date:** 2026-09-05
- **Deciders:** Architect (olatsko@gmail.com), during the `design` Socratic walk

## Context

AC-02 requires that whenever the relay does not report success — whether it rejected the request,
denied the caller, or failed to deliver the summary — the owner sees, in the same conversation
turn, that the request did not succeed and a plain-language reason, "returned as a normal, readable
result the Action can display verbatim ... never signaled in a way the Action layer could hide
behind a generic failure message." The Custom GPT Action layer sits between the relay's HTTP
response and what the model actually sees, and its handling of non-2xx responses is outside this
feature's control. This decision fixes the HTTP-status convention every response follows.

## Decision drivers

- AC-02 — the failure reason must reach the owner in-chat, never collapsed into a generic message
  by the Action layer.
- CLAUDE.md convention — every response, success or failure, uses one JSON envelope; on failure
  the shape is fixed exactly as `{ "error": "<reason>" }` — this ADR must not drift from it.
- Spec §7 KPI — "delivery outcome always visible in-chat," target 100% of handled calls.

## Considered options

1. **Always HTTP 200; JSON body carries the outcome** — every response, regardless of outcome, is
   a 200. Failure matches CLAUDE.md's envelope verbatim: `{ "error": "<reason>" }`. Success uses a
   minimal `{ "status": "sent" }` (CLAUDE.md fixes only the failure shape; the Action tells success
   from failure by whether the `error` key is present — exactly the parsing convention CLAUDE.md's
   own line describes).
2. **Conventional status codes (401/400/502) + JSON body** — a bad secret returns 401, an invalid
   summary 400, a Telegram delivery failure 502 (or similar), each still carrying a JSON body.

## Decision outcome

**Chosen:** Option 1, always HTTP 200. Some Custom GPT Action configurations surface only a generic
error to the model on a non-2xx response and discard the body — exactly the failure mode AC-02
names. Returning 200 unconditionally removes that dependency entirely: there is no status-code path
whose body could be dropped before the model sees it. The failure body stays exactly the
`{ "error": "<reason>" }` shape CLAUDE.md already fixes — no added fields, no drift.

## Consequences

**Positive**
- AC-02 is satisfied by construction, not by an assumption about the Custom GPT Action's non-2xx
  body-forwarding behavior that this feature can't verify or control.
- One response shape (200 + envelope) for every code path, and the failure body matches
  CLAUDE.md's existing envelope verbatim — no added fields, no reader having to reconcile a second
  convention on top of the one CLAUDE.md already documents.

**Negative**
- Breaks ordinary HTTP/REST convention — a 200 that failed reads as wrong to anyone skimming raw
  HTTP traffic or logs without also reading the body.
- Any future tooling (uptime checks, generic HTTP-level alerting) can't rely on status-code
  filtering; it must parse the body for the presence of an `error` key instead.

**Neutral**
- Switching to conventional status codes later is possible but requires re-verifying the Custom GPT
  Action's actual non-2xx body-forwarding behavior first — the exact uncertainty this ADR avoids
  taking on faith today.

## Links

- Spec: [[../spec.md]] AC-02, §7
- SAD: [[../sad.md]] §4
- Related ADR: [[0001-authenticate-via-a-custom-shared-secret-header]]
