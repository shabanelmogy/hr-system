<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Managed Crystal Template Validation Phase 00 - Implementation Preflight

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

- **Managed Crystal Template Validation cross-platform master review:** `../project/MANAGED_CRYSTAL_TEMPLATE_VALIDATION_FEATURE_FULL_REVIEW.md` sections 1, 2, 5, 8, 9
- **Managed Crystal Template Validation API implementation profile:** `../api/ManagedCrystalTemplateValidation_API_Implementation_Profile.md` sections 1, 10, 11
- **Managed Crystal Template Validation Next.js implementation profile:** `../web-next/features/managed-crystal-template-validation-frontend-reference.md` sections 1, 2, 12, 13
- **Managed Crystal Template Validation Expo implementation profile:** `../mobile-react/managed-crystal-template-validation-mobile-reference.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-template-validation-master | 1 | `99c7fac07b5bf9a87176fe8fa6d2a4b1c4d73b677d174f3c9af2a83a945d8e93` |
| managed-crystal-template-validation-master | 2 | `77be10bcd29ccb2a2a2cf7ee05e40c93ac3a197383e7e532ad03209b033199c5` |
| managed-crystal-template-validation-master | 5 | `7ac12d3c5d8e8c80a11904919f54556481ff4eafc53e0b77aaa7a4925381dfb1` |
| managed-crystal-template-validation-master | 8 | `2c82cf2b421c7cc3403645c0d011e9f1fbff9375017f7f50da1692a42dd786e6` |
| managed-crystal-template-validation-master | 9 | `9b47e18558b21a5532f013be086220bd6652abb68e3ce0b1b231c1e177c56866` |
| managed-crystal-template-validation-api | 1 | `f328b7348ab2e8af52b3c6089a8044dcb00bf12b87e1956d906e8d11170c7af8` |
| managed-crystal-template-validation-api | 10 | `16b287f37a94892dd07d906d9770665db062dbf49be1da57f5104f5f5aec38a1` |
| managed-crystal-template-validation-api | 11 | `15344f7d819e699896a12071f30aeae35ff866336cc8e09569210187fc43e713` |
| managed-crystal-template-validation-web | 1 | `b56af293926a4ed3714472a168135ced791c1fce4b46dd18f503aa5e9efebf04` |
| managed-crystal-template-validation-web | 2 | `767d7333c5fd11ffaedbbc0098cf926ca102cf47dfc2b217945eaa7c22215ed2` |
| managed-crystal-template-validation-web | 12 | `dc65a94add10277ddb6acabace07b9db83aac4139dad84febab203b740c60194` |
| managed-crystal-template-validation-web | 13 | `91afdb997f851ddb7a519cdd64592cfb4c27c28bf535af6389ea3896d06d37da` |
| managed-crystal-template-validation-mobile | 1 | `827f5e601f39968315b01c0a015ad29dbd519239f700eb0315a8861e16063f38` |
| managed-crystal-template-validation-mobile | 14 | `1feffa130d4cb6c760ba751ee8b3189f133f94e9c8a8dc5114e4ee6612aab6ab` |
| managed-crystal-template-validation-mobile | 15 | `46969692a043ce56f23bf1a8245cc243a1bbe0d633fcf400cbba816ad52bffcb` |
