# chat-brief-telegram

A small relay: a Custom GPT Action hands over a finished ChatGPT conversation summary, and this
service forwards it to the owner's Telegram — reporting success or failure back in the same
conversation turn.

Stateless, single-owner, one HTTP endpoint. No frontend, no database. See
[`docs/idea-brief.md`](docs/idea-brief.md) for the product intent and
[`docs/features/chat-brief-telegram/spec.md`](docs/features/chat-brief-telegram/spec.md) for the
full spec.

## Stack

Node.js 20+ · TypeScript 5 · Express, deployed as a small always-on process (not serverless —
[ADR-0003](docs/adr/0003-deploy-as-an-always-on-process.md)).

## Setup

```bash
npm install
cp .env.example .env   # fill in real values — see .env.example for what each one does
npm run dev            # runs src/index.ts directly via tsx
```

Required environment variables (the process refuses to start if any is missing/blank):

| Variable | Required | Default | Purpose |
|---|:---:|---|---|
| `TELEGRAM_BOT_TOKEN` | yes | — | Telegram bot API token (from @BotFather) |
| `TELEGRAM_CHAT_ID` | yes | — | Telegram chat the relay delivers to |
| `CHAT_BRIEF_SHARED_SECRET` | yes | — | Secret the caller must present via `X-Chat-Brief-Secret` |
| `PORT` | no | `3000` | HTTP port the relay listens on |
| `TELEGRAM_TIMEOUT_MS` | no | `5000` | Max wait for Telegram's response before treating the call as failed |

Full details: [`.env.example`](.env.example).

## API

`POST /api/v1/send` — the one relay action. Always responds `HTTP 200`; success vs. failure is
distinguished by the presence of an `error` key, not the status code (so a Custom GPT Action
never has a non-2xx path that could get swallowed before the model sees it).

```bash
curl -X POST http://localhost:3000/api/v1/send \
  -H "Content-Type: application/json" \
  -H "X-Chat-Brief-Secret: <your shared secret>" \
  -d '{"summary": "The owner asked about deployment options."}'
```

```json
{ "status": "sent" }
```

or, on any rejection or delivery failure:

```json
{ "error": "<plain-language reason>" }
```

Full contract, including every documented failure reason:
[`docs/features/chat-brief-telegram/contracts/openapi.yaml`](docs/features/chat-brief-telegram/contracts/openapi.yaml).

`GET /health` returns `{ "status": "ok" }`.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Run `src/index.ts` directly via `tsx`, for local iteration |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the built output (`dist/index.js`) |
| `npm test` | Run the test suite (Vitest) |
| `npm run lint` | Run ESLint |

## Structure

- `src/http/` — the route handler (Express app + routes)
- `src/relay/` — validates the incoming summary, calls the Telegram client, shapes the response
- `src/telegram/` — a thin wrapper over Telegram's Bot API `sendMessage` call
- `src/config/` — reads configuration from environment variables

`src/index.ts` wires `http -> relay -> telegram` directly at boot — no DI container.

Full conventions: [`CLAUDE.md`](CLAUDE.md).

## Docs

- [`docs/idea-brief.md`](docs/idea-brief.md) — product intent
- [`docs/architecture-map.md`](docs/architecture-map.md) — repo-wide architecture
- [`docs/roadmap.md`](docs/roadmap.md) — what's shipped and what's next
- [`docs/features/chat-brief-telegram/`](docs/features/chat-brief-telegram/) — spec, design, tasks, review, and changelog for this feature
