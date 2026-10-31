<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Countries page-scoped charts Phase 00 - Implementation Preflight

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

- **Countries page-scoped charts cross-platform master review:** `../modules/platform/features/angular-countries-chart-view/angular-countries-chart-view-review.md` sections 1, 2, 5, 8, 9
- **Countries page-scoped charts API implementation profile:** `../modules/platform/features/angular-countries-chart-view/angular-countries-chart-view-api.md` sections 1, 10, 11
- **Countries page-scoped charts Next.js implementation profile:** `../modules/platform/features/angular-countries-chart-view/angular-countries-chart-view-web.md` sections 1, 2, 12, 13
- **Countries page-scoped charts Expo implementation profile:** `../modules/platform/features/angular-countries-chart-view/angular-countries-chart-view-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-chart-view-master | 1 | `a041073a5176094e7235cfa440bae9bd49a6f3495e7877c80a95bdd408ae556f` |
| angular-countries-chart-view-master | 2 | `8dcb926bb1ab5f3d64b323d2b6a5cbe19e3d943467c74b04ab46eea8b465a232` |
| angular-countries-chart-view-master | 5 | `ae6d6df0f419f1dca5395a638b7a5dcbe790c0302d1b968af6a75df9fd20cadb` |
| angular-countries-chart-view-master | 8 | `e4421460076e6552298c7b3ce771b2731e8e07506acb739f5dc343dfa7c5474a` |
| angular-countries-chart-view-master | 9 | `c2c6110881b9ebcd29bc348dd848e4f72e74c89f2a77fb705a8868f3fadec7cc` |
| angular-countries-chart-view-api | 1 | `a041073a5176094e7235cfa440bae9bd49a6f3495e7877c80a95bdd408ae556f` |
| angular-countries-chart-view-api | 10 | `aa7642a3fe46ec2ac105eef011a2a2040569d19e81aba4fc4da6da28bf930a4f` |
| angular-countries-chart-view-api | 11 | `f58f250418082bce27f4b2a8c97f814ae469be74768a9b76d13a0f342eba5a42` |
| angular-countries-chart-view-web | 1 | `a041073a5176094e7235cfa440bae9bd49a6f3495e7877c80a95bdd408ae556f` |
| angular-countries-chart-view-web | 2 | `8dcb926bb1ab5f3d64b323d2b6a5cbe19e3d943467c74b04ab46eea8b465a232` |
| angular-countries-chart-view-web | 12 | `34e3a62d6717f3f71ecf2bb76b42e734c6a5f1c3109cd86c910d31f0748ec545` |
| angular-countries-chart-view-web | 13 | `20017e2332ebb47a997b4e33cbfac0e7c4d090c4fe003f2031aa0829a539ce86` |
| angular-countries-chart-view-mobile | 1 | `a041073a5176094e7235cfa440bae9bd49a6f3495e7877c80a95bdd408ae556f` |
| angular-countries-chart-view-mobile | 14 | `b35e3c6f27a6e18a9cc50855cf413065de30d92502fc1bf9be74a9ed732c519c` |
| angular-countries-chart-view-mobile | 15 | `f0752b24a31e856ecd81661dafd6f31b87c1e9e925f956fcaff0c4325895e437` |
