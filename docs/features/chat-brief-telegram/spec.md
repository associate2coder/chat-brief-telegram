---
status: Draft
owner: "olatsko@gmail.com"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-09-05"
feature_size: "S"
---

# Spec — chat-brief-telegram

> **Glossary:** [CONTEXT](../../../CONTEXT.md) (project-wide) + [CONTEXT](./CONTEXT.md) (feature-scoped)
> **Reference module / docs / channels used:** `src/http/app.ts` (existing scaffolded Express app + `/health` route, read for its response-shape convention); `docs/idea-brief.md`; `docs/architecture-map.md` + ADR-0001/0002/0003; `docs/roadmap.md`.

## 1. Context

The owner loses a ChatGPT conversation's takeaway the moment the tab closes — recalling it later means reopening ChatGPT and re-scrolling to find it, even though Telegram is where the owner actually checks things day to day (idea-brief §2, §3).

There is no external trigger — no deadline or incident. This is a personal drive to close that recall gap and to learn a complete ChatGPT-to-external-service integration end to end (idea-brief §4). Competitive research run during this spec's ideation pass confirms the gap is real: every adjacent tool (Zapier, Make.com, Bardeen, IFTTT, and the closest precedent — a forum thread wiring a Custom GPT Action directly to Telegram) treats "ChatGPT output → Telegram" as an external automation pipeline that reports failures, if at all, into its own log rather than back into the live conversation. None let the owner say "send this" mid-conversation and get an in-chat confirmation — that in-conversation trigger plus in-conversation failure feedback is the wedge this feature fills.

Committed approach: ship a stateless relay. A Custom GPT Action, invoked only on an explicit owner request, hands the relay a finished summary; the relay checks a shared secret, forwards the summary to Telegram, and reports success/failure back through the same call so the owner sees the outcome in-chat.

Traceability: `docs/idea-brief.md`, `docs/architecture-map.md` + ADR-0001 (Node/TS/Express) + ADR-0002 (no database) + ADR-0003 (always-on process, not serverless — avoids a cold-start failure mode found during the ideation pass's failure-mode research). Pattern-matched against `src/http/app.ts`'s existing single-JSON-response convention.

## 2. Goals

- The owner can deliver a conversation's takeaway to Telegram without leaving ChatGPT or manually copying text.
- Every delivery outcome (success or failure) is visible to the owner in the same conversation turn — no silent loss.

## 3. Non-goals

- Multi-user or self-serve onboarding — v1 is a single-owner tool (idea-brief §5).
- A frontend or persisted send history — v1 is a stateless relay, no UI or database (idea-brief §5, ADR-0002).
- Automatic/background triggering of a send — every send is an explicit, in-conversation owner request (CONTEXT.md, "Custom GPT Action").
- Auto-delivering Deep Research conclusions — deferred, parked as fog in `docs/roadmap.md` (idea-brief §5).
- Message formatting or labeling (context tags, per-source prefixes, timestamps) — v1 relays plain summary text only (idea-brief §5).
- A retry queue or delivery-tracking mechanism beyond a single send attempt — a failed send is reported as failed, not retried or queued by the relay itself (idea-brief §5); this is also why §6's duplicate-send risk is scoped to caller-side retries, not anything the relay attempts.
- Length or format validation on the summary content itself, beyond rejecting empty/blank — the relay trusts ChatGPT's own judgment for summary length; the "very short summary" instruction lives in the Custom GPT's own configuration, not in the relay's logic (idea-brief §6 risk 3).

## 4. User stories

### US-01: Trigger a Telegram summary mid-conversation
**As an** owner
**I want** to ask ChatGPT to send the current conversation's takeaway to Telegram
**So that** I don't lose it when I close the tab

### US-02: See send confirmation in-chat
**As an** owner
**I want** to know immediately in the same conversation whether my summary reached Telegram
**So that** I'm never left wondering if it arrived

### US-03: Be protected from unauthorized sends
**As an** owner
**I want** only my own configured Custom GPT Action to be able to trigger a Telegram send
**So that** a stranger who finds the relay's address can't spam my Telegram or misuse my bot

### US-04: Avoid empty or accidental pings
**As an** owner
**I want** the relay to refuse an empty or blank summary
**So that** my Telegram doesn't fill with meaningless notifications

### US-05: Understand a Telegram-side setup failure in plain terms
**As an** owner
**I want** a failure caused by my own Telegram setup (e.g. never having started a chat with my bot) explained back to me plainly
**So that** I know it's a one-time setup issue, not a bug I need to keep debugging

## 5. Acceptance criteria

### AC-01 (US-01) — happy path
**Given** the owner is in a ChatGPT conversation and asks to send the current takeaway to Telegram
**When** ChatGPT calls the relay with a non-empty summary and a valid shared secret
**Then** the system delivers the summary to the owner's Telegram chat and confirms success back to the conversation

### AC-02 (US-02) — error
**Given** the relay does not report success for any reason — whether it rejected the request, denied the caller, or failed to deliver the summary
**When** it reports that outcome back through the same Custom GPT Action call
**Then** the owner sees, in the same conversation turn, that the request did not succeed and a plain-language reason — without the shared secret or the Telegram bot token ever appearing in that message, regardless of which check failed

### AC-03 (US-03) — authorization
**Given** a caller does not present the correct shared secret
**When** it attempts to invoke the relay
**Then** the system denies the request, sends nothing to Telegram, and reports the denial without revealing whether the summary itself was otherwise valid

### AC-04 (US-04) — domain invariant
**Given** the Custom GPT Action calls the relay with an empty or blank summary
**When** the relay checks the request
**Then** the system rejects it, sends nothing to Telegram, and tells the caller the summary must not be empty

### AC-05 (US-05) — cross-context
**Given** the owner has never started a conversation with their configured Telegram bot
**When** ChatGPT calls the relay with a valid summary and shared secret
**Then** the system reports that Telegram could not accept the message because the owner must start a conversation with their bot first, distinguishing this from a generic delivery failure

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Latency p95 (relay round trip, request received → response returned) | ≤ 3000 ms | Integration test timing against a faked Telegram API + a manual real-world check after deploy |
| Duplicate-send safety | A caller-side retry after the Custom GPT Action's own call timeout is not deduplicated by the relay — a retry can double-deliver the same summary | Explicitly accepted, not measured (ADR-0003 removes the cold-start-specific cause of a slow response, but any timeout on the caller's side — cold-start or otherwise — can still trigger a retry) |

(Availability moved to §8 Open questions — no monitoring exists in v1 to check a number against. Throughput dropped — usage is a handful of sends a week by design, ADR-0003, and a dedicated throughput test isn't part of the architecture map's planned test surface.)

## 6.1 Security / privacy

- **Data classification:** confidential — the summary text may contain personal/work conversation content the owner chose to send, and the shared secret + Telegram bot token are credentials.
- **Personal data touched:** yes — the summary field may contain arbitrary personal/professional content; no structured PII fields are stored (no persistence at all — ADR-0002).
- **AuthZ/AuthN impact:** the relay authenticates the caller via the shared secret before doing anything else; there's only one role (owner), no permission tiers.
- **Abuse cases:**
  - Wrong/missing shared secret → denied, nothing sent, no hint about the summary's own validity (AC-03).
  - A failure message echoing the shared secret or the Telegram bot token → never allowed, in any non-success response (AC-02).
  - Brute-forcing the shared secret → no lockout or alerting in v1; accepted risk.
  - Prompt injection via pasted content instructing the model to trigger a send → the relay can't distinguish an owner-intended summary from an injected one; accepted risk.
  - Flooding via repeated sends → no rate limiting in v1; accepted risk.
- **Security review:** Required — there's a new authz boundary (the shared secret) and a named credential-leak failure mode; the owner reviews the failure-message code path specifically for credential echoing before shipping.

## 7. Metrics / KPIs

- **Continued personal usage** — baseline: 0 (unbuilt), target: the owner is still actively triggering sends at least once in each of weeks 2-4 after shipping (self-reported, no instrumentation).
- **Zero credential leaks in a failure message** — baseline: 0 known instances (unbuilt), target: 0 instances across all sends in the first 4 weeks, verified by the owner reading every failure message that occurs.
- **Delivery outcome always visible in-chat** — baseline: 0% (unbuilt), target: 100% of triggered sends produce either a success or a failure message in the same conversation turn — no silent/phantom outcome.

## 8. Open questions

- [ ] How is the shared secret issued/rotated in practice? Default now: manual redeploy with a new value. — owner: olatsko@gmail.com, due: before `sdd:design`
- [ ] What numeric availability target should v1 commit to, given there's no uptime monitoring? Default now: no formal SLO, best-effort only. — owner: olatsko@gmail.com, due: before `sdd:tasks`
