---
id: T8
title: "Document the required environment variables for deployment"
layer: "docs"
deps: ["T1"]
acs: []
files_hint: [".env.example", "README.md"]
owner: "olatsko@gmail.com"
estimate: "S"
status: "todo"
---

# T8 — Document the required environment variables for deployment

## Why

[sad.md §4](../sad.md)'s assumption ledger fixes the shared secret (and every other credential)
as env-var-only, with rotation = edit + redeploy — but that's only actionable if the exact
variable names are written down somewhere the owner will actually see at deploy time.

## What

Add a `.env.example` (or a README section) listing every environment variable
`src/config/` reads (from [T1](./t1-load-config.md)): placeholder values only, no real
token/secret/chat-id.

## Definition of Done

- [ ] `.env.example` (or README section) lists every variable `Config` reads, with a one-line
      comment on what each does.
- [ ] No real-looking credential value anywhere in the file (placeholders only).

## Notes

No test to gate this — it's documentation, not behavior. Can run any time after T1, in parallel
with everything else.
