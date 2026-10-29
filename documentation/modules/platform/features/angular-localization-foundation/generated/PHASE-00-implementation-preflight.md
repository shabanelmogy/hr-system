<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Angular Toolchain and Localization Runtime Phase 00 - Implementation Preflight

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

- **Angular Toolchain and Localization Runtime cross-platform master review:** `../modules/platform/features/angular-localization-foundation/angular-localization-foundation-review.md` sections 1, 2, 5, 8, 9
- **Angular Toolchain and Localization Runtime API implementation profile:** `../modules/platform/features/angular-localization-foundation/angular-localization-foundation-api.md` sections 1, 10, 11
- **Angular localization foundation Angular Web profile:** `../modules/platform/features/angular-localization-foundation/angular-localization-foundation-web.md` sections 1, 2, 12, 13
- **Angular Toolchain and Localization Runtime Expo implementation profile:** `../modules/platform/features/angular-localization-foundation/angular-localization-foundation-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-localization-foundation-master | 1 | `265fd2b4b95c9c933ce3aef4ccca2b46b645ca9b779d2684869d104faa9be73d` |
| angular-localization-foundation-master | 2 | `dbb9c391093ad2e63ab72da54097310c2dfddd667487d0934e43c8bb5ca9c928` |
| angular-localization-foundation-master | 5 | `71dad2ca5b311ecc4d115bee358583247edb7e5498ec4f932e1dc5aa12bf55e9` |
| angular-localization-foundation-master | 8 | `ea76c301cccd425a113f3f51a0a51d3aef602e51c8b606d67dcad157be30c5cc` |
| angular-localization-foundation-master | 9 | `46fb0447edae1fca09c9986213d9472d157e56cc4c960a40aced27e409d47265` |
| angular-localization-foundation-api | 1 | `265fd2b4b95c9c933ce3aef4ccca2b46b645ca9b779d2684869d104faa9be73d` |
| angular-localization-foundation-api | 10 | `fe7928624f22f08764dcf7e54d5651be2cb0f41f1930ac527aaa94e00a35faf6` |
| angular-localization-foundation-api | 11 | `5dab27474a1b99ba062fd373bdbdb3dd3a8a6fe523b6dbf3da6991fc4335f10e` |
| angular-localization-foundation-web | 1 | `265fd2b4b95c9c933ce3aef4ccca2b46b645ca9b779d2684869d104faa9be73d` |
| angular-localization-foundation-web | 2 | `dbb9c391093ad2e63ab72da54097310c2dfddd667487d0934e43c8bb5ca9c928` |
| angular-localization-foundation-web | 12 | `40be14913017d390ebd1bea15586705971b0542343e8c56b0b7267e5972efd62` |
| angular-localization-foundation-web | 13 | `a4f2b92cb7b0ddb46e4abfbc3ffd75253df09b1252afe8221c3bde9d44d2dd2e` |
| angular-localization-foundation-mobile | 1 | `265fd2b4b95c9c933ce3aef4ccca2b46b645ca9b779d2684869d104faa9be73d` |
| angular-localization-foundation-mobile | 14 | `8eb0574471e920e016444fe94f7ac5951ad3ffdb506efa474a7154c2ad240f95` |
| angular-localization-foundation-mobile | 15 | `1f0ba56b18e34cf44b7c9c6560feed30a0c7f4b54d243de794be546b475d1ee9` |
