# Gate checklists

Record each gate result in `status.md` and each approval or waiver in `01-decisions.md`.
Items marked **(auto)** are checked by `Test-PlanReadiness.ps1`.

## GA — Legacy understood (Track A)

- [ ] `legacy/inventory.md` covers screens, endpoints/actions, models, jobs, integrations.
- [ ] Every inventory item is in `legacy/behavior-catalog.md` or marked out of scope with a reason.
- [ ] Every rule taken from code cites `[legacy:path#L]`.
- [ ] Every defect in `legacy/defects.md` has a disposition decision.
- [ ] UI policy decided (preserve exactly / preserve flows / redesign allowed).
- [ ] Data migration in or out of scope (decision).

## GB — Business understood (Track B)

- [ ] `00-brief.md` approved by the owner (decision).
- [ ] Every Must capability has a workflow with at least one exception path.
- [ ] Every actor has a goal and appears in at least one workflow.
- [ ] No blocking open question for Must capabilities.

## GR — Ready to build

Model and rules
- [ ] Glossary covers every term used in stories and rules.
- [ ] Every relationship has cardinality, required, and delete behavior.
- [ ] Every entity is marked tenant-owned or global.
- [ ] Every Confirmed rule has an enforcement location and evidence.

Access and quality
- [ ] Tenant model and permission catalog defined.
- [ ] Scope matrix covers every actor × resource touched by first-release stories.
- [ ] IDOR policy decided.
- [ ] Concurrency, deletion/retention, audit, time zone, and localization decisions recorded.

Stories and slices
- [ ] Every first-release story is `Ready` per `definition-of-ready.md`.
- [ ] **(auto)** Every story in the slice plan exists in `08-stories.md`.
- [ ] **(auto)** Every Ready story has acceptance criteria, rules, and permissions.
- [ ] **(auto)** Slice dependencies refer to earlier slices.
- [ ] **(auto)** `conversion-manifest.json` is valid and its story IDs exist in `08-stories.md`.

Blockers and review
- [ ] **(auto)** No open blocking question.
- [ ] **(auto)** No unfilled `<<placeholder>>` in the core planning files.
- [ ] `plan-review` has no unresolved Critical/High finding (or a waiver decision exists).
- [ ] Owner approved the slice plan (decision).

## GD — Slice done

- [ ] `definition-of-done.md` satisfied for every story in the slice.
- [ ] Exit checks in `09-slice-plan.md` demonstrated.
- [ ] Story and slice statuses updated to `Done`.

## GH — Handoff / release

- [ ] All release slices `Done`.
- [ ] Data migration rehearsed and reconciled (if in scope).
- [ ] Configuration, secrets handling, and deployment runbook documented.
- [ ] Known limitations and deferred items listed.
- [ ] Production checklist from the template guides reviewed (seeders off, secrets overridden, Swagger policy, AllowedHosts, CORS).
