<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Angular application context navigation Phase 00 - Implementation Preflight

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

- **Angular application context navigation cross-platform master review:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-review.md` sections 1, 2, 5, 8, 9
- **Angular application context navigation API implementation profile:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-api.md` sections 1, 10, 11
- **Angular application context navigation Next.js implementation profile:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-web.md` sections 1, 2, 12, 13
- **Angular application context navigation Expo implementation profile:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-module-context-navigation-master | 1 | `c55738e67daf516bad24d330b5eaa48d89aa771aa0c5c9367dde7a00cf1a6302` |
| angular-module-context-navigation-master | 2 | `cd0441cf47d901383bbcd3f66cd55e25b22eca84f14b433a4c4e5a4136a775b5` |
| angular-module-context-navigation-master | 5 | `ad37f9208578207bb142bb810412eea23caf874669fcc873c8cfd31d088c353d` |
| angular-module-context-navigation-master | 8 | `8fe455f912589c8225049720348791a1b3f36a0bbb64fd18640fe27e425f1726` |
| angular-module-context-navigation-master | 9 | `5c8b535c12fcf226da0d043061e2fe30da081036abe32c27e1862428f2f872a9` |
| angular-module-context-navigation-api | 1 | `c55738e67daf516bad24d330b5eaa48d89aa771aa0c5c9367dde7a00cf1a6302` |
| angular-module-context-navigation-api | 10 | `dddfcf4db65993beab3a319f9abebb699878f3620d64ea3cab5d74456652b3e5` |
| angular-module-context-navigation-api | 11 | `1fbb9765392d357a650913625dc67d4591b4d163b68b5ee40e753d1d5e1b6168` |
| angular-module-context-navigation-web | 1 | `c55738e67daf516bad24d330b5eaa48d89aa771aa0c5c9367dde7a00cf1a6302` |
| angular-module-context-navigation-web | 2 | `cd0441cf47d901383bbcd3f66cd55e25b22eca84f14b433a4c4e5a4136a775b5` |
| angular-module-context-navigation-web | 12 | `4b8a857346e8e30ca6d40ceb3ec49deba68787019ea091c95ba451bc002452fe` |
| angular-module-context-navigation-web | 13 | `056ee58455fb971a375392b39fb541869ce38b807f5b937eb3c8353ed316a30b` |
| angular-module-context-navigation-mobile | 1 | `c55738e67daf516bad24d330b5eaa48d89aa771aa0c5c9367dde7a00cf1a6302` |
| angular-module-context-navigation-mobile | 14 | `08c29bfc093044341e820929da4c858953f2f7d374c22a80f4f21f5a6e4b24cb` |
| angular-module-context-navigation-mobile | 15 | `323b611e52e573c8ef93e22bf36d9791e49bb95dcc9470fc3678b072b0d8b13e` |
