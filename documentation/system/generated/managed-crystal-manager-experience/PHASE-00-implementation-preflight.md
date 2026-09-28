<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Managed Crystal Report Manager Experience Phase 00 - Implementation Preflight

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

- **Managed Crystal Report Manager Experience cross-platform master review:** `../project/MANAGED_CRYSTAL_MANAGER_EXPERIENCE_FEATURE_FULL_REVIEW.md` sections 1, 2, 5, 8, 9
- **Managed Crystal Report Manager Experience API implementation profile:** `../api/ManagedCrystalManagerExperience_API_Implementation_Profile.md` sections 1, 10, 11
- **Managed Crystal Report Manager Experience Next.js implementation profile:** `../web-next/features/managed-crystal-manager-experience-frontend-reference.md` sections 1, 2, 12, 13
- **Managed Crystal Report Manager Experience Expo implementation profile:** `../mobile-react/managed-crystal-manager-experience-mobile-reference.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-manager-experience-master | 1 | `86a467db71e27b2a605dc632ea28bf03e62c8e67eb3c9afe47acc6431c107fdb` |
| managed-crystal-manager-experience-master | 2 | `a151603e2716490402fcbe07172e77fd63d1554595797b29df93a3b989cc0b53` |
| managed-crystal-manager-experience-master | 5 | `8e5ec68fb4bc3432ce57f1ef4942c19edf59c4154ae1e2465f37b46a69823c5a` |
| managed-crystal-manager-experience-master | 8 | `c04f821b9512863559aba221fd5f54a4d45a4cf7dbf9f14b482fd69b59cb21a4` |
| managed-crystal-manager-experience-master | 9 | `b3f632e92be51b9dd07d47a5d300530d9e47275faf6cf87fab0863e2588e803e` |
| managed-crystal-manager-experience-api | 1 | `6840a63612be69e6e2fc2c30c9ee314fb819ab9c4200a3fc254b4b3ffd799f95` |
| managed-crystal-manager-experience-api | 10 | `0ab127d92eedad1d1ff51c9c541f6b29fa5c2a243e44b342e16621429344f2c4` |
| managed-crystal-manager-experience-api | 11 | `1e1138376f3825d87fe8808b7570500c8a1c57b477fb6d465064fa70261cf0fe` |
| managed-crystal-manager-experience-web | 1 | `6ad4feb35947f3ff729423e5f382ae966f512a1598d3154bff516f216f048f91` |
| managed-crystal-manager-experience-web | 2 | `126da15795e92d3b779689801c697c31474442e122c11ee93ff80b75b26bbfc7` |
| managed-crystal-manager-experience-web | 12 | `6c66740d2664b339b62554c3506fdff4551e2908dbb8994b2864183e13e9ae69` |
| managed-crystal-manager-experience-web | 13 | `559cf90a7ec238f7ea97e465dac3b38fe2a2dbb9bf3c2f178ad6f935dd335903` |
| managed-crystal-manager-experience-mobile | 1 | `4593daa1728acaa76ca733030809f86a61b5ab8e9ce5edafaed8738b91517831` |
| managed-crystal-manager-experience-mobile | 14 | `b08ee644641d0e5acf27e25b891a4764e9e8288a81739fdab182a45aeafc41bd` |
| managed-crystal-manager-experience-mobile | 15 | `366e849971dc0752669b7e2cc3ab7be575ca93110f72fffbd20fa795fdaa6f8d` |
