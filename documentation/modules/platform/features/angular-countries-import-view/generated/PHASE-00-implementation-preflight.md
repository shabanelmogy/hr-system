<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Countries XLSX import Phase 00 - Implementation Preflight

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

- **Countries XLSX import cross-platform master review:** `../modules/platform/features/angular-countries-import-view/angular-countries-import-view-review.md` sections 1, 2, 5, 8, 9
- **Countries XLSX import API implementation profile:** `../modules/platform/features/angular-countries-import-view/angular-countries-import-view-api.md` sections 1, 10, 11
- **Countries XLSX import Angular implementation profile:** `../modules/platform/features/angular-countries-import-view/angular-countries-import-view-web.md` sections 1, 2, 12, 13
- **Countries XLSX import Expo implementation profile:** `../modules/platform/features/angular-countries-import-view/angular-countries-import-view-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-import-view-master | 1 | `1f2e36875d18e37ec8a6df6af056e4947e3eba8b06467c3a6f3013d7a568655f` |
| angular-countries-import-view-master | 2 | `422a13518e26e2c6ee47d12275238b34fbaf7a75dfb45e65d77f1376c4515e5f` |
| angular-countries-import-view-master | 5 | `3673a2c7c459efed4be5b56d814d01b31e1291b7cc3c645b9106386457f5d443` |
| angular-countries-import-view-master | 8 | `b3c4409235a89b89abcc628d2a834a38b5c30d5793e24bfb207a2c9bcd6f1677` |
| angular-countries-import-view-master | 9 | `bbba187c534e0637214cb864a3f268ffdf3dca121eaad7f9d413334fe10dea0d` |
| angular-countries-import-view-api | 1 | `1f2e36875d18e37ec8a6df6af056e4947e3eba8b06467c3a6f3013d7a568655f` |
| angular-countries-import-view-api | 10 | `47e64969da4971e661128ac73ad0f901ccfd17949c2856ffdd37c0c37bda76c3` |
| angular-countries-import-view-api | 11 | `6cb7786af1c177babf51eb605ea16c9cb5f85484c6a2a6d6ea138e39cbf67aa0` |
| angular-countries-import-view-web | 1 | `1f2e36875d18e37ec8a6df6af056e4947e3eba8b06467c3a6f3013d7a568655f` |
| angular-countries-import-view-web | 2 | `422a13518e26e2c6ee47d12275238b34fbaf7a75dfb45e65d77f1376c4515e5f` |
| angular-countries-import-view-web | 12 | `ec1a71bb79a1df59c7669872683dbb8180c0c987562423a18eb8b0e64c12b4be` |
| angular-countries-import-view-web | 13 | `4d7bd414678262665b7f89f01a552b43bf3120d65e993916c20f11e45fdc0743` |
| angular-countries-import-view-mobile | 1 | `1f2e36875d18e37ec8a6df6af056e4947e3eba8b06467c3a6f3013d7a568655f` |
| angular-countries-import-view-mobile | 14 | `00543cc395f4ade3ba26da7dca4538c0733b44e06804788e0b9a6dcfbdd6c2b5` |
| angular-countries-import-view-mobile | 15 | `2f531c9e1a7906ca3b77d3d7d45409b64b8d6e107eae70cfc1b6a511ac1c9e8e` |
