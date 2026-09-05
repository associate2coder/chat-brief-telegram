# data-model audit — chat-brief-telegram — 2026-09-05

## Outcome

**No schema change.** Zero entities, zero staged migrations. This is the fast-lane N/A case
(`api` would also have accepted this skip on the size matrix — no contract change follows from
no schema change either).

## Convention derivation (step 2)

- `docs/architecture-map.md` §Migrations: `migration_tool: ""` — explicitly empty, annotated
  "no database in v1 — see ADR-0002." No naming convention or PK strategy to detect or follow,
  because there is no migration tool in play.
- `docs/features/chat-brief-telegram/sad.md` §4 Solution strategy: "no persistence, no cache, no
  queue" (traced to project ADR-0002 + ADR-0003). §8 Crosscutting: "ID strategy | N/A."
  §5 Building block view / C4 Container: one `backend-service` container, no `ContainerDb`.
- Accepted ADRs checked: project-level `0002-no-database-in-v1.md` (repo root `docs/adr/`) is the
  originating decision; this feature's own two ADRs (`0001` auth header, `0002` result envelope)
  don't touch persistence.
- No divergence found between the architecture's decision and the repo's actual state — there is
  no live `migrations/` tree, no schema files, nothing to corroborate or contradict.

## Staged migrations

None. No `docs/features/chat-brief-telegram/migrations/` directory was created — there is nothing
to stage. `implement` has nothing to promote for this feature's persistence layer, because there
is no persistence layer.

## Drift detection (step 11)

Explored the domain layer (`src/relay/index.ts`, `src/telegram/index.ts`) — both are still
placeholder stubs (`export {};`) per the scaffold, with no struct/field definitions to map to a
column. No drift findings; none possible until the feature has actual entities, which it doesn't
plan to.

## Self-check (step 12)

| Check | Result |
|---|---|
| Naming matches repo convention | N/A — no schema exists to name |
| Down reversibility (every CREATE has a DROP, etc.) | N/A — no migrations were generated |
| FK indexes (every `REFERENCES` has an index) | N/A — no tables, no FKs |
| Convention adherence (repo's detected conventions followed) | Pass — the repo's own convention *is* "no database" (ADR-0002), and this output follows it exactly by producing nothing |

## `<!-- TBD -->` markers

None — every section of `data-model.md` is a confirmed N/A backed by three independent upstream
sources (architecture map, SAD §4/§6/§8, spec §3), not an undecided placeholder.

## Next stage

`api`'s own N/A condition (no contract change) does **not** hold here — the feature does have one
HTTP contract (the relay endpoint itself, per `sad.md` §5), it's just that the contract carries no
persisted data. So the next stage is still `/sdd:api chat-brief-telegram` — it derives the
OpenAPI shape from `sad.md` §5/§6 + ADR-0001/0002 (the auth header + the response envelope), not
from this (empty) data model.
