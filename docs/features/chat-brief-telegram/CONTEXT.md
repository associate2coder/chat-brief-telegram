---
status: Living
updated_at: "2026-09-05"
---

# Domain Context — chat-brief-telegram

<!--
CONTEXT.md is the domain glossary — not a spec and not a scratch pad. NO implementation
detail here (no datastore/broker/framework names, no API contracts) — only domain words
and the boundaries between them. Implementation choices live in the SAD and ADRs; behaviour
lives in spec.md.

Terms get fixed inline, the moment they surface in an interview / spec / review — never
batched «I'll consolidate later». Empty H2 → prune before commit; keep only the sections
that carry real content. ## Glossary is mandatory; the other two are optional.
-->

## Glossary

- Custom GPT Action — the mechanism inside a Custom GPT that lets ChatGPT call this feature's relay mid-conversation, only when the owner explicitly asks (e.g. "send this to Telegram"). NOT an automatic/background trigger — it only fires from an explicit, in-conversation request the model decides to act on; the future Deep Research extension needs a different trigger for exactly this reason.
- shared secret — a fixed value configured in both the Custom GPT Action and the relay, sent on every call and checked before any Telegram send is attempted. NOT the Telegram bot token — the bot token authenticates the relay to Telegram, the shared secret authenticates the caller (ChatGPT) to the relay; confusing the two is exactly how the bot token could leak.
