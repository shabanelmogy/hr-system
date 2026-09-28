---
name: slice-planning
description: Use to order stories into vertical, dependency-aware slices with exit checks and to produce the conversion manifest that drives the generators (phase C6).
---
# Slice planning

## Purpose

Turn the stories into a build order where each slice delivers a working, testable business
outcome, and produce `conversion-manifest.json` so the template generators can scaffold it.

## Inputs

`08-stories.md`, `05-domain-model.md`, `03-actors-access.md`, `07-quality-attributes.md`,
`templates/conversion/conversion-manifest.schema.json`,
`templates/conversion/conversion-manifest.example.json`.

## Procedure

1. **Slice 0 — Platform baseline.** Always first: generated workspace running, platform admin
   bootstrapped, first tenant and tenant admin created, sign-in and tenant selection working,
   roles/permission catalog seeded, CI green. No business features.
2. **Dependency graph.** From the domain model: reference data before the entities that use it;
   profiles before workflows; workflows before reports. Example order: catalogs → people/profiles
   → core transactional workflow → secondary workflows → reporting → integrations.
3. **Cut slices.** A slice is 1–4 stories that together deliver one outcome end to end (API,
   authorization, persistence, UI, tests). Prefer thin and complete over wide and partial.
4. **Exit checks.** For each slice list the concrete checks that prove it done: the acceptance
   criteria IDs to demonstrate, tests that must exist, and any data/migration step.
5. **Size.** S (≤1 day), M (2–3 days), L (a week — consider splitting). Note uncertainty.
6. **Release line.** Mark which slices form the first release.
7. **Blocked stories.** A slice containing a `Blocked` story cannot be `Ready`. Move independent
   stories to an earlier slice when that unblocks progress.

### Write the slice plan table (exact columns — parsed by the readiness script)

```markdown
| Slice | Name | Stories | Depends on | Size | Release | Status | Exit checks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S0 | Platform baseline | — | — | S | R1 | Planned | workspace builds; tenant admin can sign in |
| S1 | Customer directory | CRM-001, CRM-002 | S0 | M | R1 | Planned | AC CRM-001.1–3; IDOR test; lookup |
```

### Produce the manifest

Create `planning/conversion-manifest.json` (manifest version 1):

- `project`: name and .NET namespace; `source`: legacy stack or `"none (greenfield)"`.
- `target`: `multiTenant`, `tenantName` (the owner's word, e.g. "School"), `cultures`.
- One `features[]` entry per business resource that needs API routes: `name` (PascalCase),
  `route` (kebab-case), `idType`, `operations`, `permissions`, `tenantScoped`, `searchFields`,
  `stories` (id, actor, goal, resourceScope, acceptance — copied from `08-stories.md`),
  `relationships`.
- The manifest cannot hold every detail (fields, rules, UI). Those stay in the planning files;
  the manifest is the index the generators need.

Validate:

```powershell
pwsh ./planning/_system/Test-ConversionManifest.ps1 -Path ./planning/conversion-manifest.json
```

## Outputs

`09-slice-plan.md`, `conversion-manifest.json`, `status.md` updated.

## Quality bar

- Every Ready story appears in exactly one slice.
- Every slice's dependencies appear earlier in the table.
- Every slice has exit checks that reference acceptance criteria.
- The manifest validates and its story IDs match `08-stories.md`.

## Anti-patterns

- Horizontal slices ("all entities", then "all APIs", then "all screens").
- Putting reporting before the data it reports on exists.
- A first slice that is a big-bang of the whole domain.
