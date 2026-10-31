<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Shared boolean field preparation Phase 00 - Implementation Preflight

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

- **Shared boolean field preparation cross-platform master review:** `../modules/platform/features/angular-boolean-field-foundation/angular-boolean-field-foundation-review.md` sections 1, 2, 5, 8, 9
- **Shared boolean field preparation API implementation profile:** `../modules/platform/features/angular-boolean-field-foundation/angular-boolean-field-foundation-api.md` sections 1, 10, 11
- **Shared boolean field preparation Next.js implementation profile:** `../modules/platform/features/angular-boolean-field-foundation/angular-boolean-field-foundation-web.md` sections 1, 2, 12, 13
- **Shared boolean field preparation Expo implementation profile:** `../modules/platform/features/angular-boolean-field-foundation/angular-boolean-field-foundation-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-boolean-field-foundation-master | 1 | `0ae423c021b74f3d4b4c4eccb231cbad9e834575b3123a543b419214a7199d4d` |
| angular-boolean-field-foundation-master | 2 | `7df39a32680faa803fac2f024cdd16a69c102b3185eb01cf3d3d437e907890ea` |
| angular-boolean-field-foundation-master | 5 | `3cd8929002b69dced37aadda0a53c2e47f73351a37ae9a936597ef2eb3798499` |
| angular-boolean-field-foundation-master | 8 | `653cc093d61e1ef12c7cebe2d2f0e0408d7c8eb7a561ba0993b8776d7a14b66b` |
| angular-boolean-field-foundation-master | 9 | `aeb73463a736e3afc44a5c8a0e4b87ec424d4cf94c519c925a73c44192ca73ed` |
| angular-boolean-field-foundation-api | 1 | `0ae423c021b74f3d4b4c4eccb231cbad9e834575b3123a543b419214a7199d4d` |
| angular-boolean-field-foundation-api | 10 | `65025d0bddf1b98c587bd4cc2be53ffa24786df04ab9851b7f3666fa1c9d21d0` |
| angular-boolean-field-foundation-api | 11 | `a7500482bc0f7ba74d1dfaaaa201a2b834ef8d65330eec06b2b928a6b39933ff` |
| angular-boolean-field-foundation-web | 1 | `0ae423c021b74f3d4b4c4eccb231cbad9e834575b3123a543b419214a7199d4d` |
| angular-boolean-field-foundation-web | 2 | `7df39a32680faa803fac2f024cdd16a69c102b3185eb01cf3d3d437e907890ea` |
| angular-boolean-field-foundation-web | 12 | `c8e140e7a3d9e643dd5a7af10a661fb28177db73db20ad06e98c1b2692ba3a5c` |
| angular-boolean-field-foundation-web | 13 | `d975f89d73aa5002720b88c1803beaff4fcd7debbea157646cdf01c938a97604` |
| angular-boolean-field-foundation-mobile | 1 | `0ae423c021b74f3d4b4c4eccb231cbad9e834575b3123a543b419214a7199d4d` |
| angular-boolean-field-foundation-mobile | 14 | `71e44480a29b9a7882fe9afed7b83a097feb84f91e5c36bd2c4f4dc963914c6b` |
| angular-boolean-field-foundation-mobile | 15 | `6e78e61e77ecc4d9c79b57a7a26410c8041467221372b79d2b97c5269c55a798` |
