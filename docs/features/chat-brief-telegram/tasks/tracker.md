# Tracker — chat-brief-telegram

> Status of every task in the epic. `implement` updates `done` as it commits each task.
> States: `todo` · `in_progress` · `blocked` · `review` · `done`.

| # | Task | Layer | Owner | Estimate | Blocked by | Status |
|---|---|---|---|---|---|---|
| T1 | Load and validate relay configuration from environment variables | infra | olatsko@gmail.com | S | — | done |
| T2 | Implement the Telegram sendMessage client wrapper with a bounded timeout | infra | olatsko@gmail.com | M | T1 | done |
| T3 | Implement summary validation | domain | olatsko@gmail.com | S | — | done |
| T4 | Implement shared-secret authorization check (fail-closed) | domain | olatsko@gmail.com | S | T1 | done |
| T5 | Implement the relay orchestration service | app | olatsko@gmail.com | M | T2, T3, T4 | done |
| T6 | Add the POST /api/v1/send route and wire the modules | ports | olatsko@gmail.com | M | T5 | done |
| T7 | Add the end-to-end integration test | tests | olatsko@gmail.com | M | T6 | done |
| T8 | Document the required environment variables | docs | olatsko@gmail.com | S | T1 | done |

**Total:** 8 tasks, ~1 person-week (matches `.size` = S, ~1 week per the size matrix).
