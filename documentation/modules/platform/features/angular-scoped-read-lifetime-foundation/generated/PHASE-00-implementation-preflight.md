<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Shared scoped read lifecycle preparation Phase 00 - Implementation Preflight

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

- **Shared scoped read lifecycle preparation cross-platform master review:** `../modules/platform/features/angular-scoped-read-lifetime-foundation/angular-scoped-read-lifetime-foundation-review.md` sections 1, 2, 5, 8, 9
- **Shared scoped read lifecycle preparation API implementation profile:** `../modules/platform/features/angular-scoped-read-lifetime-foundation/angular-scoped-read-lifetime-foundation-api.md` sections 1, 10, 11
- **Shared scoped read lifecycle preparation Next.js implementation profile:** `../modules/platform/features/angular-scoped-read-lifetime-foundation/angular-scoped-read-lifetime-foundation-web.md` sections 1, 2, 12, 13
- **Shared scoped read lifecycle preparation Expo implementation profile:** `../modules/platform/features/angular-scoped-read-lifetime-foundation/angular-scoped-read-lifetime-foundation-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-scoped-read-lifetime-foundation-master | 1 | `affab6a6bae3ef30b7a8ec0acb620d08dbf7ab3c145a5ea8f00a521d1ac89f34` |
| angular-scoped-read-lifetime-foundation-master | 2 | `1bb9daf1545478de79c557020442733fa754af50a233daa5573cfde1c1724bcd` |
| angular-scoped-read-lifetime-foundation-master | 5 | `7032fb41fa7fb04596774df8bf48965cb55dcd7da1690659abf5038c3dddee05` |
| angular-scoped-read-lifetime-foundation-master | 8 | `1f828870c40492b5373285085bdbdd3baed7160e0ab16279f29f7886293254c9` |
| angular-scoped-read-lifetime-foundation-master | 9 | `40c959e2c189d36d2616af34473c0acaf8e389ee88a9844d27c10ac7767682ef` |
| angular-scoped-read-lifetime-foundation-api | 1 | `affab6a6bae3ef30b7a8ec0acb620d08dbf7ab3c145a5ea8f00a521d1ac89f34` |
| angular-scoped-read-lifetime-foundation-api | 10 | `0375ed805314d411457a3111f0e06abbc07908f2541f02c9588a834a24f36b52` |
| angular-scoped-read-lifetime-foundation-api | 11 | `e26d99a0a657ccafbb59bd2de87c3d7f447cf25a3239c9ea26f0a39b952de8fc` |
| angular-scoped-read-lifetime-foundation-web | 1 | `affab6a6bae3ef30b7a8ec0acb620d08dbf7ab3c145a5ea8f00a521d1ac89f34` |
| angular-scoped-read-lifetime-foundation-web | 2 | `1bb9daf1545478de79c557020442733fa754af50a233daa5573cfde1c1724bcd` |
| angular-scoped-read-lifetime-foundation-web | 12 | `83c84ad268b229bca4c4b1e1917ab3585f88c1f024376d0c01c100ab72a9dab3` |
| angular-scoped-read-lifetime-foundation-web | 13 | `9dbd734d9f7fa9887a086f61f728bdf098c0879e84f30ff462ca2c2fde9fdaa0` |
| angular-scoped-read-lifetime-foundation-mobile | 1 | `affab6a6bae3ef30b7a8ec0acb620d08dbf7ab3c145a5ea8f00a521d1ac89f34` |
| angular-scoped-read-lifetime-foundation-mobile | 14 | `b9f8f64bea6b8ba01b4e432c16b80039a7347a488149603ac1f4c4613ecc9b54` |
| angular-scoped-read-lifetime-foundation-mobile | 15 | `4ec4717c052e3bd05ffd044457f074133397f2a7ddec46eab6a6dc83cd9a3d87` |
