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

- owner — the single person who uses this tool: has the Custom GPT Action configured under their own ChatGPT account and controls the one Telegram chat destination it sends to. NOT a generic ChatGPT "user" — only the owner's own configured instance can trigger a send, however many people use ChatGPT generally.
- summary — the short, finished text ChatGPT produces from the current conversation before calling the relay: the exact string that gets forwarded to Telegram. NOT the full conversation transcript — the relay never sees or processes the raw conversation, only this already-condensed string.
