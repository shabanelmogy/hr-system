<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Angular shared collection foundation Phase 00 - Implementation Preflight

## Purpose

Translate an already approved plan/slice into an implementation execution packet.
This phase does **not** repeat product discovery or silently re-decide approved
business rules.

For new business capabilities or substantial rebuilds, the central plan under
`documentation/plans/` is the authority for product intent, scope, ownership,
business rules, and approved decisions. This phase verifies that the current
repository still matches the evidence used by that plan and maps the authorized
slice onto concrete runtime surfaces.

## Required outputs

1. Record the canonical Plan ID, plan path, authorized slice/phase, and current gate
   status.
2. Confirm the requested implementation is inside the authorized slice.
3. Confirm the plan's Feature Decomposition Gate binds this Feature ID to one
   coherent execution unit. When the slice is `Decompose`, read and verify the
   child Screen/Workflow Contract and reuse audit created from
   `documentation/plans/FEATURE_DECOMPOSITION_TEMPLATE.md`.
4. Inspect the current owning runtime capability and verify there has been no
   material drift since planning.
5. Complete the Existing-System Relationship Review and shared-reuse inventory.
6. Map each feature-unit requirement to Domain/Application/Infrastructure/Presentation,
   Web, Mobile, tests, migrations, integrations, and documentation as applicable.
7. Import approved business decisions from the plan into the implementation request;
   do not create a competing rule set.
8. Record any implementation-only detail that the plan intentionally left to the
   execution workflow.
9. Define the exact verification commands/evidence required before Phase 06 can
   return `Verified`.

## Drift rule

If current source contradicts a material planning assumption or implementation
discovers a new business decision that changes persisted meaning, lifecycle,
ownership, scope, security, or a Required customer journey:

1. stop the affected implementation work;
2. update/reopen the relevant central plan gate;
3. resolve the decision in the canonical plan/decision log;
4. resume only after the affected slice is authorized again.

Do not resolve material product ambiguity inside a handler, migration, UI component,
or feature-local document.

## Preflight checklist

- [ ] Canonical Plan ID/path and authorized slice are recorded, or this is explicitly
      classified as a small change inside an already approved capability.
- [ ] Current plan gate authorizes this implementation scope.
- [ ] Feature Decomposition Gate contains this exact Feature ID for the authorized
      slice; `Decompose` slices have at least two distinct child Feature IDs.
- [ ] For a decomposed slice, this child has a complete Screen/Workflow Contract:
      closest reference, exact reusable components, workspace/screens/journeys,
      typed transport/server criteria, states, permissions/read-only, concurrency,
      i18n/RTL/accessibility/responsive behavior, tests, and child exit gate.
- [ ] Current runtime was inspected for drift since planning.
- [ ] Owning module/capability and relationship classification are confirmed.
- [ ] No parallel/legacy/workaround owner is being introduced.
- [ ] Shared BuildingBlocks, module-local abstractions, Web shared components, and
      Mobile shared components were inventoried before adding new ones.
- [ ] Plan requirements are mapped to concrete implementation surfaces.
- [ ] Approved plan decisions are referenced rather than duplicated/re-decided.
- [ ] Any new material business decision was routed back to the plan before coding.
- [ ] API/Web/Mobile Required/Deferred/Excluded decisions match the authorized slice.
- [ ] Migration/data compatibility impact is known.
- [ ] Verification evidence required for Phase 06 is explicit.
- [ ] Customer Education Pack is classified `Required` or `N/A — reason`; a
      customer-visible slice must be `Required`.

## Approved references

- **Angular shared collection foundation cross-platform master review:** `../modules/platform/features/angular-collection-foundation/angular-collection-foundation-review.md` sections 1, 2, 5, 8, 9
- **Angular shared collection foundation API implementation profile:** `../modules/platform/features/angular-collection-foundation/angular-collection-foundation-api.md` sections 1, 10, 11
- **Angular shared collection foundation Angular web implementation profile:** `../modules/platform/features/angular-collection-foundation/angular-collection-foundation-web.md` sections 1, 2, 12, 13
- **Angular shared collection foundation Expo implementation profile:** `../modules/platform/features/angular-collection-foundation/angular-collection-foundation-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-collection-foundation-master | 1 | `a9babd7b0386fa829ac02d973057e96ab29761c7cde3a2f73806ca5da3a0a77a` |
| angular-collection-foundation-master | 2 | `ab50d090b58609d2bd08a52ba5b40d1e7769f63398e9370d31c02347f9a60078` |
| angular-collection-foundation-master | 5 | `eb41e60b3ccb7bff3e9779fbd2fae7ffbb4abe217a04bb29cd5b42cbcf12b7f1` |
| angular-collection-foundation-master | 8 | `c5930c59d67c5efccc1bda1aba04bdacb2ce11cb936ddfb4306e541ee2a782af` |
| angular-collection-foundation-master | 9 | `72b4e325040d35ad3426bf2fc0686fa85b299e5f2e349735a570c0cd93a88e25` |
| angular-collection-foundation-api | 1 | `a9babd7b0386fa829ac02d973057e96ab29761c7cde3a2f73806ca5da3a0a77a` |
| angular-collection-foundation-api | 10 | `7653f373d77818eab834faf40a1877d9492456d68d7394c81de97df13dc9c17b` |
| angular-collection-foundation-api | 11 | `900f3d8706f3bbad21a81d915d3c5e875b5862f8c4f8df0f37d9834504346239` |
| angular-collection-foundation-web | 1 | `a9babd7b0386fa829ac02d973057e96ab29761c7cde3a2f73806ca5da3a0a77a` |
| angular-collection-foundation-web | 2 | `ab50d090b58609d2bd08a52ba5b40d1e7769f63398e9370d31c02347f9a60078` |
| angular-collection-foundation-web | 12 | `01f711480bf46a59884a1c0ef5ecf9efadacc73f531d0c69236f14d5b91e43e9` |
| angular-collection-foundation-web | 13 | `22c80fdb52fd1cf880f807ef351f9851f394bfa956c756b6ec4e84e9e22128a1` |
| angular-collection-foundation-mobile | 1 | `a9babd7b0386fa829ac02d973057e96ab29761c7cde3a2f73806ca5da3a0a77a` |
| angular-collection-foundation-mobile | 14 | `2495418f57ef4e931d5971a7f5cf495934d28d1da4b34398894c657e7853a3fc` |
| angular-collection-foundation-mobile | 15 | `9088a7ed9203940469f0bda4a96bae95ef7ff7144ef4d527d137fe7d1ce09932` |
