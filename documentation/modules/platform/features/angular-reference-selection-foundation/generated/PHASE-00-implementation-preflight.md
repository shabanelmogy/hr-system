<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Angular shared reference selection foundation Phase 00 - Implementation Preflight

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

- **Angular shared reference selection foundation cross-platform master review:** `../modules/platform/features/angular-reference-selection-foundation/angular-reference-selection-foundation-review.md` sections 1, 2, 5, 8, 9
- **Angular shared reference selection foundation API implementation profile:** `../modules/platform/features/angular-reference-selection-foundation/angular-reference-selection-foundation-api.md` sections 1, 10, 11
- **Angular shared reference selection Web implementation profile:** `../modules/platform/features/angular-reference-selection-foundation/angular-reference-selection-foundation-web.md` sections 1, 2, 12, 13
- **Angular shared reference selection foundation Expo implementation profile:** `../modules/platform/features/angular-reference-selection-foundation/angular-reference-selection-foundation-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-reference-selection-foundation-master | 1 | `1ecd36f0f84fb8e830c2e7fdca7b2a8edfc3d311b1e55f70ea5ea5bf585539b5` |
| angular-reference-selection-foundation-master | 2 | `537611928d4ad534cb9ca0e397c9acbcf72e233ccfdbb56417fa922dd41c63c4` |
| angular-reference-selection-foundation-master | 5 | `e7255f0794a2b4f0a3e64af0a6d7b202cd9bc75cc83b4e612decfd22facb43d9` |
| angular-reference-selection-foundation-master | 8 | `6a2b5a31d342ee7f4b5d95bf35cb98c65de7e9bc88c0218f080411461abbbeba` |
| angular-reference-selection-foundation-master | 9 | `e0cae5b9f75bda3965fbb2f4a7484fc6fe1da3799a7f9cd5b990b855b5c7216b` |
| angular-reference-selection-foundation-api | 1 | `1ecd36f0f84fb8e830c2e7fdca7b2a8edfc3d311b1e55f70ea5ea5bf585539b5` |
| angular-reference-selection-foundation-api | 10 | `3dc1fc0618d3a5213ece8855cc506bb6a802c6f5b514953ce804fdc8e569ab93` |
| angular-reference-selection-foundation-api | 11 | `ab8a7910fbd3887fd970ce73c314a0edb77a9bc31ea92718e1c0a7e52125331c` |
| angular-reference-selection-foundation-web | 1 | `1ecd36f0f84fb8e830c2e7fdca7b2a8edfc3d311b1e55f70ea5ea5bf585539b5` |
| angular-reference-selection-foundation-web | 2 | `537611928d4ad534cb9ca0e397c9acbcf72e233ccfdbb56417fa922dd41c63c4` |
| angular-reference-selection-foundation-web | 12 | `5e7ee30f9514eda6d7646df4ed1a8b48c021294a9858a7d367ca023d78107fad` |
| angular-reference-selection-foundation-web | 13 | `8a0e9b2afd08ee458dc726db082d539dda2fb85dc081256d7da2685c46f728fb` |
| angular-reference-selection-foundation-mobile | 1 | `1ecd36f0f84fb8e830c2e7fdca7b2a8edfc3d311b1e55f70ea5ea5bf585539b5` |
| angular-reference-selection-foundation-mobile | 14 | `c87dcc831c9c118ead7cdba58939b37332a68c9cce35b62118efb7b8cfb9c40a` |
| angular-reference-selection-foundation-mobile | 15 | `c998942c4a4625d1665614da6ec46fefbea425abcad16ab8867719a5b2c3c83c` |
