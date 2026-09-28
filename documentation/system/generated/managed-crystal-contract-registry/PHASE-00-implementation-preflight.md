<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Managed Crystal Contract Registry Phase 00 - Implementation Preflight

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

- **Managed Crystal Contract Registry cross-platform master review:** `../project/MANAGED_CRYSTAL_CONTRACT_REGISTRY_FEATURE_FULL_REVIEW.md` sections 1, 2, 5, 8, 9
- **Managed Crystal Contract Registry API implementation profile:** `../api/ManagedCrystalContractRegistry_API_Implementation_Profile.md` sections 1, 10, 11
- **Managed Crystal Contract Registry Next.js implementation profile:** `../web-next/features/managed-crystal-contract-registry-frontend-reference.md` sections 1, 2, 12, 13
- **Managed Crystal Contract Registry Expo implementation profile:** `../mobile-react/managed-crystal-contract-registry-mobile-reference.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-contract-registry-master | 1 | `881223996c9b314133379fbca2d7731cd6cc6821867871724e3129495d866abf` |
| managed-crystal-contract-registry-master | 2 | `39792944d0bbea4087398aaf5f0e44661410f3264f727c8342287e6c540e9591` |
| managed-crystal-contract-registry-master | 5 | `06142cc7aa005dbdbec4378418ba9f97c50e22ef70afc05dd4ffe1390a949f95` |
| managed-crystal-contract-registry-master | 8 | `9c1edb8c857d186995a0213e1360d1fed18a24b8c8505be64cccd43559fc05ed` |
| managed-crystal-contract-registry-master | 9 | `9c9c40542018224adc2f0ff57ad311685b6da773da9766a292397cc275049095` |
| managed-crystal-contract-registry-api | 1 | `9d1e6de5fe56e8d9e0ef68953fe9265a54d04420f403e425aaf8872fef56ea9d` |
| managed-crystal-contract-registry-api | 10 | `946142661a68c5e3852151f10a8b14bb82f665bf0003c1cabfbb45bd5185121f` |
| managed-crystal-contract-registry-api | 11 | `3c43cbe843b440fd556e75ccbdb6868bc97dcfa71a9ddf0dd86a7eb3593bd771` |
| managed-crystal-contract-registry-web | 1 | `ebb7eceda26d64a792ce389a128db43c0a9d889da9819aa2e4092c159d4f284e` |
| managed-crystal-contract-registry-web | 2 | `5dedb236c971a41a38f01856465bd13d45bb92bda56a2325f912eca4944322cb` |
| managed-crystal-contract-registry-web | 12 | `3f89f32ac7aac690ce0df3b3d9b44b51361bb0f8997d9423fc39835ad63c72ec` |
| managed-crystal-contract-registry-web | 13 | `b2bac052ae6ff5bbc4a7157323e5e38363317db4b2ceb125af3b34e363d188f9` |
| managed-crystal-contract-registry-mobile | 1 | `e23713002c5f4d6f8683ad29b27288c149e732d3ca54eb4034ecdc8d63c08542` |
| managed-crystal-contract-registry-mobile | 14 | `706f30fc618ce61509ac8893ffbde1db1bdc3dc6a3c66bdff62e0b7064f82c13` |
| managed-crystal-contract-registry-mobile | 15 | `427b4e3385025a3de716d50a97c2fddb3cc82dd28705db33dc0ee3099a1b04ae` |
