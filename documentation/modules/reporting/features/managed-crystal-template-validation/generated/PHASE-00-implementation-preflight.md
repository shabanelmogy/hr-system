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

- **Managed Crystal Template Validation cross-platform master review:** `../modules/reporting/features/managed-crystal-template-validation/managed-crystal-template-validation-review.md` sections 1, 2, 5, 8, 9, 11, 12, 13, 14
- **Managed Crystal Template Validation API implementation profile:** `../modules/reporting/features/managed-crystal-template-validation/managed-crystal-template-validation-api.md` sections 1, 10, 11, 12, 13, 14, 15
- **Managed Crystal Template Validation Next.js implementation profile:** `../modules/reporting/features/managed-crystal-template-validation/managed-crystal-template-validation-web.md` sections 1, 2, 12, 13, 15, 16, 17, 18
- **Managed Crystal Template Validation Expo implementation profile:** `../modules/reporting/features/managed-crystal-template-validation/managed-crystal-template-validation-mobile.md` sections 1, 14, 15, 16, 17, 18, 19

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-template-validation-master | 1 | `99c7fac07b5bf9a87176fe8fa6d2a4b1c4d73b677d174f3c9af2a83a945d8e93` |
| managed-crystal-template-validation-master | 2 | `77be10bcd29ccb2a2a2cf7ee05e40c93ac3a197383e7e532ad03209b033199c5` |
| managed-crystal-template-validation-master | 5 | `7ac12d3c5d8e8c80a11904919f54556481ff4eafc53e0b77aaa7a4925381dfb1` |
| managed-crystal-template-validation-master | 8 | `2c82cf2b421c7cc3403645c0d011e9f1fbff9375017f7f50da1692a42dd786e6` |
| managed-crystal-template-validation-master | 9 | `9b47e18558b21a5532f013be086220bd6652abb68e3ce0b1b231c1e177c56866` |
| managed-crystal-template-validation-master | 11 | `3f41bb5a4d3db8359baeb00d8f408d1a627398ed0bb65686eb5289ae3806d272` |
| managed-crystal-template-validation-master | 12 | `f82b7aff75cf17c21b7c81eb688638474e323eb05c2bb728734c4264fba1f712` |
| managed-crystal-template-validation-master | 13 | `0fd76edfc5407361816949b20ba8a0fbfa30fcea04c0b92bb23ab9bf543e5d96` |
| managed-crystal-template-validation-master | 14 | `65d5e3778b817b758e6462edcfef72ca7d15c7ec943e3049fff328a15e7f025b` |
| managed-crystal-template-validation-api | 1 | `f328b7348ab2e8af52b3c6089a8044dcb00bf12b87e1956d906e8d11170c7af8` |
| managed-crystal-template-validation-api | 10 | `16b287f37a94892dd07d906d9770665db062dbf49be1da57f5104f5f5aec38a1` |
| managed-crystal-template-validation-api | 11 | `ff92c432042e3f362a67dd8aba4fa4000153ea78c64fcf8ce96d54e5f446a6c6` |
| managed-crystal-template-validation-api | 12 | `d8b71662b09abda042effb5b5979aa6a29e6bba2fcc9f92a1998958188d44ecd` |
| managed-crystal-template-validation-api | 13 | `905afaf4256b7e50b2ff7323ae416832ae26d685997a63d32c5b67e4a13e7912` |
| managed-crystal-template-validation-api | 14 | `74e23a0061a413d4bcb719fe916892cde052ba634870c0905a5b547c9de29a32` |
| managed-crystal-template-validation-api | 15 | `970f562ea88dc0ff462fa6bd28307c47c3980cb5524d74d2f4ad7db187dbb6bf` |
| managed-crystal-template-validation-web | 1 | `b56af293926a4ed3714472a168135ced791c1fce4b46dd18f503aa5e9efebf04` |
| managed-crystal-template-validation-web | 2 | `767d7333c5fd11ffaedbbc0098cf926ca102cf47dfc2b217945eaa7c22215ed2` |
| managed-crystal-template-validation-web | 12 | `dc65a94add10277ddb6acabace07b9db83aac4139dad84febab203b740c60194` |
| managed-crystal-template-validation-web | 13 | `91afdb997f851ddb7a519cdd64592cfb4c27c28bf535af6389ea3896d06d37da` |
| managed-crystal-template-validation-web | 15 | `71ffd06889cb60c076af3477beeb2cbd52eb6d79637070b86260a6c6a3a5b5a9` |
| managed-crystal-template-validation-web | 16 | `92f766b38be7067a49e3e4ec14ee504f576e615feca8933e6343bff2dc76222e` |
| managed-crystal-template-validation-web | 17 | `f725d9892667343198dda4470b74910f0fb9c8bf9585ca1d8f34b4e9973f7b19` |
| managed-crystal-template-validation-web | 18 | `5491240deb33af6bad5272dd5c39e038f87e09ab9cd06ec50853701da767a388` |
| managed-crystal-template-validation-mobile | 1 | `827f5e601f39968315b01c0a015ad29dbd519239f700eb0315a8861e16063f38` |
| managed-crystal-template-validation-mobile | 14 | `1feffa130d4cb6c760ba751ee8b3189f133f94e9c8a8dc5114e4ee6612aab6ab` |
| managed-crystal-template-validation-mobile | 15 | `74f7d3fc128a5ecc2d1730de6f975b594afae7f3b3623823a55e60ab37e182f8` |
| managed-crystal-template-validation-mobile | 16 | `d21f20f467817757e3187ecebcdd0a53aa5c5dc6d2880a0cd11f92ed815d6e8b` |
| managed-crystal-template-validation-mobile | 17 | `b0834738d4c76cf8d337d5d8e58445e410821856d8cdd9b374f9d9742e4e99ff` |
| managed-crystal-template-validation-mobile | 18 | `185541b1009cb128d62ed9ca6765e8577221a8470d0d65a6fe29964f23da6c30` |
| managed-crystal-template-validation-mobile | 19 | `96dc4deaf700e4e8b5383efb25e3f05edeea2942f22648c41390b900927db9af` |
