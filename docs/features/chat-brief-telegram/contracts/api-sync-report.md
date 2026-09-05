# api sync report — chat-brief-telegram

## Interface kind

`sad.md` frontmatter `target_surfaces: [backend-service]` → HTTP/REST → OpenAPI 3.1
(`contracts/openapi.yaml`). No async flows anywhere in `sad.md` §6 (all three flows are
synchronous request/response, per §4's "no persistence, no cache, no queue"), so no
`events.md` was produced.

## Gate

`data-model.md` is **present**, not absent — this is not the fast-lane skip. It documents zero
entities (see its own N/A note, corroborated by `architecture-map.md` and `sad.md` §4/§8). The
consequence for this report: every request/response field's origin is either an ADR (the wire
mechanics) or a spec AC (the one business field, `summary`) — none traces to a `data-model.md`
column, because none exists. This is expected, not a gap; noted per-row below.

## Section A — field-origins table

| schema_path | origin | confidence |
|---|---|---|
| `sendSummaryToTelegram.requestBody.summary` | spec.md §5 AC-04 ("zero-length, whitespace-only, or missing/not text") + sad.md §6 Flow 1/2 (`summary + shared-secret header`) | medium — no data-model column exists (feature has zero entities); the field name, type, and rejection rule are explicit in the spec and every sequence, not inferred from a message name alone |
| `sendSummaryToTelegram.security.SharedSecretAuth` (header `X-Chat-Brief-Secret`) | ADR-0001 (authenticate via a custom shared-secret header) | high |
| `sendSummaryToTelegram.responses.200.SendSuccess.status` | ADR-0002 (always HTTP 200 with `{ "status": "sent" }` on success) + sad.md §6 Flow 1 | high |
| `sendSummaryToTelegram.responses.200.SendError.error` | ADR-0002 + `CLAUDE.md` §Conventions (failure shape `{ "error": "<reason>" }`, verbatim, unchanged by this feature) | high |
| `SendError.error` values: `unauthorized` | spec.md AC-03 + sad.md §6 Flow 2 | medium — exact wording is the relay's own plain-language judgment (spec AC-02), not a fixed string the spec mandates |
| `SendError.error` values: empty-summary reason | spec.md AC-04 + sad.md §6 Flow 2 | medium — same reason |
| `SendError.error` values: Telegram-not-started reason | spec.md AC-05 + sad.md §6 Flow 3 | medium — AC-05 requires *distinct* wording from the generic case but doesn't fix the exact string |
| `SendError.error` values: generic Telegram failure (incl. timeout) | spec.md AC-02 + spec §6 NFR (5000ms timeout) + sad.md §6 Flow 3 | medium — same reason |

No `low`-confidence rows: every field traces to either an Accepted ADR or a named spec AC + a
drawn sequence — nothing is inferred from a bare sequence-message name alone.

## Section B — drift findings (4-point checklist)

1. **Endpoint ↔ data-model** *(core)* — ✓, via the documented fallback: `data-model.md` names
   zero entities, so the check falls back to "every endpoint maps to a §4 user story"
   (per this point's own fallback rule). `POST /api/v1/send` maps to all five user stories
   (US-01 through US-05) — this feature has exactly one endpoint carrying every story's
   behavior, which is consistent with `sad.md`'s single-container, single-route design.

2. **Error code ↔ repo error definition** *(core)* — ✓, with a **deliberate deviation from the
   api skill's own default**, recorded here rather than silently applied: the skill's baseline
   error envelope is `{code, message, details?}` with a neutral `module.error_name` registry
   convention. This feature's `SendError` schema is `{error: "<plain-language reason>"}` instead
   — **deviation by ADR-0002** (this feature) **+ `CLAUDE.md` §Conventions** (project-level),
   both of which fix the failure shape before this skill ran. There is no `code` field and no
   error registry to check against, because spec AC-02 explicitly requires a *plain-language*
   reason the Action displays verbatim, not a machine code. This is the correct behavior per the
   upstream ADRs, not a missing registry — no reconcile action needed.

3. **Validation ↔ constraint** *(core)* — ✓. `summary`'s `minLength: 1` + the
   `^(?=.*\S).+$` pattern together implement AC-04's "zero-length, whitespace-only, or missing"
   rejection rule exactly (JSON Schema `minLength` alone only catches the zero-length case; the
   pattern adds the whitespace-only case). No `data-model.md`/existing-schema constraint to
   reconcile against, since the field is never persisted.

4. **OpenAPI ↔ sequence** *(supporting)* — ✓. Every `alt`/`else` branch across the three `sad.md`
   §6 flows has a matching `200` response example: Flow 1's success → `SendSuccess`; Flow 2's
   "secret missing or wrong" / "summary empty or blank" / "Telegram rejects" → three `SendError`
   examples; Flow 3's "chat not started" / "timeout" / "other rejection" → the remaining two
   `SendError` examples (the third, "other rejection," reuses Flow 2's generic example — same
   wording, same branch semantics). No orphan branches, no response with no source flow.

**0 core findings failed, 0 total flags** — no pause triggered; the report documents two
intentional ADR-driven deviations from the api skill's own defaults (auth scheme, error
envelope shape), not unresolved drift.

## Deliberately absent from this contract

- **`Idempotency-Key` header** — not added, despite `POST` being a mutating-in-effect call. No
  `sad.md` §6 flow shows a retry note or an async actor (the protocol's own trigger for this
  header), and spec.md §3 non-goals + §6 explicitly accept caller-side-retry duplicate sends as
  unmitigated risk ("a retry can double-deliver the same summary... not deduplicated by the
  relay itself"). Adding dedup infrastructure here would contradict that accepted-risk decision,
  not implement it.
- **Cursor pagination** — no list endpoint exists; the feature has one action, not a resource
  collection.
- **`events.md`** — no async flows anywhere in `sad.md` §6.

## Lint

`spectral lint` (via `spectral:oas` ruleset) — 0 errors, 0 warnings after adding `info.contact`
and an operation tag.
