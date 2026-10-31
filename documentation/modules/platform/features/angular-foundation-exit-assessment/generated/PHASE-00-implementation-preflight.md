<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Foundation exit and pilot readiness assessment Phase 00 - Implementation Preflight

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

- **Foundation exit and pilot readiness assessment cross-platform master review:** `../modules/platform/features/angular-foundation-exit-assessment/angular-foundation-exit-assessment-review.md` sections 1, 2, 5, 8, 9
- **Foundation exit and pilot readiness assessment API implementation profile:** `../modules/platform/features/angular-foundation-exit-assessment/angular-foundation-exit-assessment-api.md` sections 1, 10, 11
- **Foundation exit and pilot readiness assessment Next.js implementation profile:** `../modules/platform/features/angular-foundation-exit-assessment/angular-foundation-exit-assessment-web.md` sections 1, 2, 12, 13
- **Foundation exit and pilot readiness assessment Expo implementation profile:** `../modules/platform/features/angular-foundation-exit-assessment/angular-foundation-exit-assessment-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-foundation-exit-assessment-master | 1 | `4579413623709aeac863bbf783f02814bc3d1481bf1c4ddae184774a52e0507a` |
| angular-foundation-exit-assessment-master | 2 | `a73ce6b46bce9f34ed00180d86d88be490d97104fa2cd668ebd21e7b405af207` |
| angular-foundation-exit-assessment-master | 5 | `25cc0fdd99b871c548937b062151de690f320e28a2b4cb992754e45fe5dbae61` |
| angular-foundation-exit-assessment-master | 8 | `a68ecda2bfe01f209cbb52e0793eaeb7d6966de6a5c17412d244ec9fdfc9f3ce` |
| angular-foundation-exit-assessment-master | 9 | `5617cac65bbfa4d8cf8a167359903eb51c4ab7ef68f1fcfc00cb268848e0c8a4` |
| angular-foundation-exit-assessment-api | 1 | `4579413623709aeac863bbf783f02814bc3d1481bf1c4ddae184774a52e0507a` |
| angular-foundation-exit-assessment-api | 10 | `dfd965d7afe5fffcff2d3df939f8447b6070c5a7bf56d76963ec3b264ede0f5f` |
| angular-foundation-exit-assessment-api | 11 | `a41f7ddf6804f9ac73e341369b1de373fd3da999c0fc5948788176cc586e1e87` |
| angular-foundation-exit-assessment-web | 1 | `4579413623709aeac863bbf783f02814bc3d1481bf1c4ddae184774a52e0507a` |
| angular-foundation-exit-assessment-web | 2 | `a73ce6b46bce9f34ed00180d86d88be490d97104fa2cd668ebd21e7b405af207` |
| angular-foundation-exit-assessment-web | 12 | `4e3e136533d711dc2b1944d65a953ef4885f1b7b00a44335da47fe4e8cc5bb71` |
| angular-foundation-exit-assessment-web | 13 | `ad1e70fd9e3fda8329f14c174716f62e03fee38c52f04284521ce671c894995b` |
| angular-foundation-exit-assessment-mobile | 1 | `4579413623709aeac863bbf783f02814bc3d1481bf1c4ddae184774a52e0507a` |
| angular-foundation-exit-assessment-mobile | 14 | `06037cd3923e8c9c270638644046f38cd4f54ffadf2f942d2c5d7bf81b217439` |
| angular-foundation-exit-assessment-mobile | 15 | `f22a993e7f41983c616e3516d2c5b0e9dbe3a677d9272e7c25722584d5b4be72` |
