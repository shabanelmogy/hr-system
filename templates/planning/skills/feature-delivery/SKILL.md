---
name: feature-delivery
description: Use to implement one planned slice end to end in a generated workspace — API use cases, authorization and scope, persistence, UI, and tests — and prove it meets its exit checks (Track D).
---
# Feature delivery

## Purpose

Build exactly what the slice plan says, in the template's architecture, and leave evidence that
it works. One slice at a time.

## Inputs

- The slice row in `09-slice-plan.md` and its stories in `08-stories.md`
- Linked rules (`06-business-rules.md`), access rules (`03-actors-access.md`), quality decisions
  (`07-quality-attributes.md`), domain model (`05-domain-model.md`)
- Architecture guides: `api/TEMPLATE_GUIDE.md`, `api/TEMPLATE_CHECKLIST.md`,
  `web/NEXT_TEMPLATE_GUIDE.md`, `web/COMPONENT_CATALOG.md` (names may differ per workspace)
- Scaffolds created by the generator: `api/src/<App>.Application/Features/<Feature>/` and
  `web/src/features/<route>/`

## Procedure

1. **Prepare.** Mark the slice `In progress` in `09-slice-plan.md` and `status.md`. Restate the
   slice goal and exit checks in two lines. If any linked story is not `Ready`, stop and report.
2. **Backend, inside-out:**
   1. Domain: entity/aggregate with explicit constructor/factory and methods that enforce the
      invariants (`BR-…`). No persistence or HTTP concerns.
   2. Application: commands/queries (source-generated Mediator), FluentValidation validators,
      stable errors (`Area.Reason`), response contracts, repository abstractions, resource-scope
      checks through the scope abstraction. Queries are read-only.
   3. Infrastructure: one `IEntityTypeConfiguration` per entity; tenant ownership (`ITenantEntity`),
      tenant-scoped unique indexes, tenant-aware FKs, delete behavior, row version where decided;
      repository; lookup service if `lookup` is planned.
   4. Migration: generate, **read it**, check indexes/FKs/constraints match the model.
   5. API: thin controller — permission attribute, dispatch, map `Result` to HTTP (201 + Location
      on create, 204 on delete). Localization keys for new messages (en + ar).
3. **Frontend:**
   1. Zod schemas for every response in `web/src/features/<route>/`; server API adapter; mutation
      adapter through the BFF (`/api/upstream/...`). Never expose tokens to client code.
   2. Pages under `src/app/(app)/<route>/` compose the feature; reuse catalog components before
      creating new ones.
   3. Loading, empty, error, validation, and forbidden states. Permission-aware navigation entry.
   4. Track A with UI preservation: keep the legacy layout, fields, and order; change only the
      data source.
4. **Tests** — at minimum per story:
   - each acceptance criterion;
   - authorization negative case (missing permission → 403);
   - scope/IDOR case (other tenant's or out-of-scope ID → 404 per policy);
   - invariant/duplicate/concurrency case where the story has one;
   - validation failure shape (ProblemDetails with stable code).
5. **Verify.** Build and test both sides; run the slice's exit checks; walk through
   `checklists/definition-of-done.md`.
6. **Close.** Update story statuses to `Done`, the slice to `Done`, `status.md` next actions.
   New questions discovered during the build go to `11-open-questions.md`; if the answer changes
   a rule, update the rule (new ID or superseded) — never silently change behavior.
7. **Template repository only:** run `template-promotion` for reusable changes.

## Outputs

Code, migration, tests, updated `08-stories.md`, `09-slice-plan.md`, `status.md`.

## Quality bar

- Every acceptance criterion is demonstrated by a test or a recorded manual check.
- No business rule lives only in the frontend.
- No endpoint without a permission check and a scope check.

## Anti-patterns

- Starting with the controller or the database table.
- Building two slices at once.
- "Temporary" bypasses of tenant/permission checks.
- Changing the plan in code without updating the planning files.
