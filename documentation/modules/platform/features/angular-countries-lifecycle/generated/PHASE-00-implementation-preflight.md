<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Countries archive and restore Phase 00 - Implementation Preflight

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

- **Countries archive and restore cross-platform master review:** `../modules/platform/features/angular-countries-lifecycle/angular-countries-lifecycle-review.md` sections 1, 2, 5, 8, 9
- **Countries archive and restore API implementation profile:** `../modules/platform/features/angular-countries-lifecycle/angular-countries-lifecycle-api.md` sections 1, 10, 11
- **Countries archive and restore Next.js implementation profile:** `../modules/platform/features/angular-countries-lifecycle/angular-countries-lifecycle-web.md` sections 1, 2, 12, 13
- **Countries archive and restore Expo implementation profile:** `../modules/platform/features/angular-countries-lifecycle/angular-countries-lifecycle-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-lifecycle-master | 1 | `1f1370064af30c953d980a7e69c15ba75d9088091a66b6e34fdaf78566ce6eef` |
| angular-countries-lifecycle-master | 2 | `4c7f0a13faaa13c5147c36f77a58550184056382bce2484b8842994b48755165` |
| angular-countries-lifecycle-master | 5 | `60080ac65c3480367b6aed2361faf4a2878f724fd85c98679ed4498e919e259a` |
| angular-countries-lifecycle-master | 8 | `666370365740a43f1c958be3f6068e9349259450ddceb922cbd87521a825c607` |
| angular-countries-lifecycle-master | 9 | `6c08316e9011bf4af0c9b35261ef93ed45b66954d59e93cb192ca8c5eb69b5ad` |
| angular-countries-lifecycle-api | 1 | `1f1370064af30c953d980a7e69c15ba75d9088091a66b6e34fdaf78566ce6eef` |
| angular-countries-lifecycle-api | 10 | `030e42cb4a42c82430ec2e0580076939f542a4db8345e80c239a8642c4c931e4` |
| angular-countries-lifecycle-api | 11 | `a3598268a0d4ef491b466389ab4f513512d9f78be03e1f5ca8a9fb22f1e29cc5` |
| angular-countries-lifecycle-web | 1 | `1f1370064af30c953d980a7e69c15ba75d9088091a66b6e34fdaf78566ce6eef` |
| angular-countries-lifecycle-web | 2 | `4c7f0a13faaa13c5147c36f77a58550184056382bce2484b8842994b48755165` |
| angular-countries-lifecycle-web | 12 | `0e461e50d4b0d2ce1882e2d6208dedad460f8b49c27253e31a39a7dc66a5ec10` |
| angular-countries-lifecycle-web | 13 | `19949119c8350ef9264aa1f47cfe68e3b3c964cba3b88e8c7aedc2c4f0c80e29` |
| angular-countries-lifecycle-mobile | 1 | `1f1370064af30c953d980a7e69c15ba75d9088091a66b6e34fdaf78566ce6eef` |
| angular-countries-lifecycle-mobile | 14 | `1290c411947da0be85db525c3a06a0b7dae44d880c05c5854452989c14576816` |
| angular-countries-lifecycle-mobile | 15 | `587fa35315ffba9fcaead1269c1f153206e418e3d3d5534ae6fc03a228eba3c7` |
