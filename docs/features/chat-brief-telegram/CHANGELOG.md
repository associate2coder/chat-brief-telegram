# Changelog — chat-brief-telegram

## chat-brief-telegram — relay a ChatGPT conversation summary to the owner's Telegram

**What:** A Custom GPT Action can now hand a finished conversation summary to a small relay
service, which forwards it to the owner's Telegram chat and reports the outcome — success or a
plain-language failure reason — back to the same conversation turn.

**Why:** Closes the recall gap where a ChatGPT conversation's takeaway is lost once the tab
closes ([spec](spec.md) §1, §2). Built as a stateless relay — no database
([ADR-0002](../../adr/0002-no-database-in-v1.md)), deployed as an always-on process rather than
serverless to avoid a cold-start failure mode ([ADR-0003](../../adr/0003-deploy-as-an-always-on-process.md)).
Callers authenticate via a custom shared-secret header
([ADR-0001](adr/0001-authenticate-via-a-custom-shared-secret-header.md)), and every response —
success or failure — uses one HTTP 200 JSON envelope so the Action layer can't hide the outcome
behind a generic error page ([ADR-0002](adr/0002-always-return-http-200-with-a-result-envelope.md)).

**How to use:** `POST /api/v1/send` with header `X-Chat-Brief-Secret: <shared secret>` and body
`{ "summary": "<text>" }` — see [openapi.yaml](contracts/openapi.yaml). Returns
`{ "ok": true }` on success or `{ "error": "<plain-language reason>" }` on any failure (wrong
secret, empty summary, Telegram delivery failure, or the owner never having started a chat with
their bot).

**Operational notes:**
- Migration: none (no database — ADR-0002).
- Feature flag / config: requires `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`,
  `CHAT_BRIEF_SHARED_SECRET` set at boot (the process refuses to start if any is missing/blank);
  optional `PORT` (default 3000) and `TELEGRAM_TIMEOUT_MS` (default 5000, min 1).
- Rollback: revert the deploy — stateless, no data to migrate back.

**Acceptance criteria delivered:** AC-01 (happy-path delivery + in-chat confirmation), AC-02
(every non-success outcome reported in-chat with a plain-language reason, no credential leak),
AC-03 (wrong shared secret denied without revealing summary validity), AC-04 (empty/whitespace/
non-text summary rejected), AC-05 (owner-never-started-the-bot reported with distinct wording).
