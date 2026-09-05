---
status: Draft
owner: "olatsko@gmail.com"
updated_at: "2026-09-05"
depth: "medium"
---

# Idea brief — chat-brief-telegram

## 1. Raw idea

My project is called Chat Brief to Telegram. The idea is to create a small ChatGPT integration that takes the current conversation, turns the important information into a very short summary, and sends it directly to the user's Telegram. ChatGPT is responsible for understanding the conversation and creating the summary, while my application only handles sending the prepared message through a Telegram bot. I want to keep the first version intentionally simple, without a frontend or database, so I can focus on building and understanding the complete flow from ChatGPT to an external service. Later, I would like to extend the project so that when a Deep Research task is completed, its main conclusions can also be summarized and delivered to Telegram automatically.

## 2. Problem

Valuable conclusions reached inside a ChatGPT conversation live only in that thread — recalling one later means reopening ChatGPT and re-scrolling to find it, even though Telegram is where the owner actually checks things day to day. There is currently no way to move a takeaway out of a chat into a durable, easy-to-check place without manually copying and pasting it.

## 3. Users

Just the idea owner in v1 — a single person who uses ChatGPT and Telegram side by side and wants a specific chat's conclusion delivered to where they already look daily, without opening ChatGPT again to find it.

## 4. Why now

No external trigger — no deadline, incident, or contract behind this. The driver is personal: closing the "conversation ends, the insight is lost" gap for the owner's own use, and using it as a vehicle to build and understand a complete integration from ChatGPT to an external service before extending it further.

## 5. Out of scope

- Deep Research auto-delivery — deferred; it completes with no live conversation turn to hook into, so it needs a different trigger shape than v1's and will be designed separately later.
- Multi-user or self-serve support — v1 is hardcoded to one Telegram destination for the owner only, no onboarding flow.
- Any frontend or database — no UI, no persistence, no history of what was sent or when.
- Message formatting/labeling (context tags, per-source prefixes, timestamps) — v1 relays plain summary text only; scannability across many sent messages is a deferred concern.
- Any retry queue or delivery-tracking mechanism beyond a single send attempt.

## 6. Risks

- Weakest spot: with no persistence anywhere, a failed or lost send leaves no trace — the only failure signal is ChatGPT relaying an error back in the same conversation turn, and if the owner isn't reading that reply, the message is simply gone.
- Assumes a single shared secret is enough protection for the one public endpoint the integration needs — resolved in favor of a static shared secret over relying on the URL being obscure, but this is weaker than per-user auth if the tool ever grows past a single owner.
- Assumes ChatGPT will reliably hand over a short, well-formed summary on its own before calling out — the app does no validation, length-checking, or truncation of what it's asked to relay, so a verbose or malformed summary passes straight through to Telegram untouched.
- Assumes the "send it" trigger always happens inside a live conversation turn — this is exactly what breaks for the later Deep Research extension, which finishes asynchronously with nobody present to say "send this."

## 7. Recommendation

Ship v1 as a deliberately thin relay: a ChatGPT-side integration that, only when the owner explicitly asks mid-conversation, hands the app one finished summary string and nothing else — the app's entire job is forwarding that string to one hardcoded Telegram destination, guarded by a shared secret, with delivery failures reported back through the same conversation turn rather than logged silently. Resist every addition — labels, multiple destinations, persistence, retries — until this thin path is built and understood end to end; the point of v1 is learning the complete flow, not covering every case. Treat the Deep Research extension as a genuinely separate future effort with its own trigger design, not a variant of this one.

## 8. Open questions

- Exact wording/length the ChatGPT side should be instructed to target for "very short summary" — owner, before `/sdd:specify`.
- How the shared secret is issued/rotated in practice — owner, can be resolved during design.
- Whether a successful send needs any confirmation back to the owner in-chat, or silence-on-success is acceptable — owner, worth deciding in `specify`.
