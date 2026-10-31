<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Countries create and edit workflow Phase 00 - Implementation Preflight

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

- **Countries create and edit workflow cross-platform master review:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-review.md` sections 1, 2, 5, 8, 9
- **Countries create and edit workflow API implementation profile:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-api.md` sections 1, 10, 11
- **Countries create and edit workflow Next.js implementation profile:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-web.md` sections 1, 2, 12, 13
- **Countries create and edit workflow Expo implementation profile:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-edit-workflow-master | 1 | `d46506912b9934a2c6ba023b994989f84386796cc2df6f50882477c3ed8714ce` |
| angular-countries-edit-workflow-master | 2 | `69e135396446c50c716b2a6a02dcf3c44a0c458a22831f62074b0f7bd160cc5b` |
| angular-countries-edit-workflow-master | 5 | `9e4c812bc1ac25ecc365f17515aaaceb899f41acf26ee693b6411da8de5c18dc` |
| angular-countries-edit-workflow-master | 8 | `ff276aa95fc18c307c2643d7f5b234fd8cc7b61a7a3028ff07d0e9d8ed3a9710` |
| angular-countries-edit-workflow-master | 9 | `b55df01be12c2ea1f2e5a24818e4fa75a7f9a9d56308f87afe33f278801d5e3f` |
| angular-countries-edit-workflow-api | 1 | `d46506912b9934a2c6ba023b994989f84386796cc2df6f50882477c3ed8714ce` |
| angular-countries-edit-workflow-api | 10 | `564a8021c73eace16eb080013f1642aeaa13633e4c3a21f7121220904a608d2a` |
| angular-countries-edit-workflow-api | 11 | `adda81dee42224b01bc2856c4f6282a4e94dd40fce4d5c5c636539fb544f459a` |
| angular-countries-edit-workflow-web | 1 | `d46506912b9934a2c6ba023b994989f84386796cc2df6f50882477c3ed8714ce` |
| angular-countries-edit-workflow-web | 2 | `69e135396446c50c716b2a6a02dcf3c44a0c458a22831f62074b0f7bd160cc5b` |
| angular-countries-edit-workflow-web | 12 | `023c1f0759d9e28fd51a1d3bc5d29849c23a156b2bfe19bebc5559ee18334fb9` |
| angular-countries-edit-workflow-web | 13 | `4f2482d3a8078435c3b1aa19e3a5c242fc8a6ca5bafd8027bbb30d7446eee075` |
| angular-countries-edit-workflow-mobile | 1 | `d46506912b9934a2c6ba023b994989f84386796cc2df6f50882477c3ed8714ce` |
| angular-countries-edit-workflow-mobile | 14 | `fedd30cc133188972b1381cabddc8b91141c174788a8138b9bb8d0eb2f20f366` |
| angular-countries-edit-workflow-mobile | 15 | `3bdb97fabcca5472fbecbb8945f60ca7500fd39e3eef75a68338e90f6bc895c5` |
