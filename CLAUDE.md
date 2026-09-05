# chat-brief-telegram — conventions

A small relay service: a Custom GPT Action hands over a short chat summary, this service
forwards it to the owner's Telegram. See `docs/idea-brief.md` for the product intent and
`docs/architecture-map.md` for the full foundation this file summarizes.

## Stack

Node.js 20 + TypeScript 5, Express for the one HTTP route. No frontend, no database (see
`docs/adr/0002-no-database-in-v1.md`) — this is a stateless API-only relay, deployed as a small
always-on process rather than a serverless function (`docs/adr/0003-deploy-as-an-always-on-process.md`).

## Structure

Flat 3-layer layout, no hexagonal ceremony — this is sized for one endpoint:

- `src/http/` — the route handler (Express app + routes).
- `src/relay/` — the service layer: validates the incoming summary, calls the Telegram client, shapes the response.
- `src/telegram/` — a thin wrapper over Telegram's Bot API `sendMessage` call.
- `src/config/` — reads configuration (bot token, chat id, shared secret, port) from environment variables.

`src/index.ts` wires `http -> relay -> telegram` directly at boot — no DI container.

## Conventions

- **Error handling:** every HTTP response, success or failure, uses one JSON envelope. On failure: `{ "error": "<reason>" }`. This lets the Custom GPT Action parse the outcome the same way regardless of which layer failed.
- **Persistence:** none. No IDs, no migrations — see `docs/adr/0002-no-database-in-v1.md`.
- **Tests:** unit tests live beside the module they test, as `*.test.ts` (e.g. `src/http/app.test.ts`). The end-to-end integration test that fakes the Telegram API lives at `src/app.integration.test.ts` (it drives the full app, so it sits at `src/` root rather than inside any one layer). Run with `npm test` (Vitest).
- **Lint:** `npm run lint` (ESLint flat config, `eslint.config.mjs`).
- **Build:** `npm run build` (`tsc`, output to `dist/`). `npm start` runs the built output; `npm run dev` runs `src/index.ts` directly via `tsx` for local iteration.
- **Inter-module communication:** direct function calls only — single process, no queues or events.

## Current state

The `chat-brief-telegram` feature is built: `src/http/app.ts` exposes `/health` plus
`POST /api/v1/send` — the shared-secret check, summary validation, Telegram delivery, and
in-conversation failure reporting described in `docs/features/chat-brief-telegram/spec.md`. See
`docs/features/chat-brief-telegram/` for the spec/design/review trail and `docs/roadmap.md` for
what's next.
