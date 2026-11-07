<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# System log collection consistency Phase 00 - Implementation Preflight

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

- **System log collection consistency cross-platform master review:** `../modules/platform/features/angular-system-log-collection-consistency/angular-system-log-collection-consistency-review.md` sections 1, 2, 5, 8, 9
- **System log collection consistency API implementation profile:** `../modules/platform/features/angular-system-log-collection-consistency/angular-system-log-collection-consistency-api.md` sections 1, 10, 11
- **System log collection consistency Next.js implementation profile:** `../modules/platform/features/angular-system-log-collection-consistency/angular-system-log-collection-consistency-web.md` sections 1, 2, 12, 13
- **System log collection consistency Expo implementation profile:** `../modules/platform/features/angular-system-log-collection-consistency/angular-system-log-collection-consistency-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-log-collection-consistency-master | 1 | `b06ba8cb0ce9db0b852396774e0a816050c4aea473bb32ce287bc4011a0187fa` |
| angular-system-log-collection-consistency-master | 2 | `f0823b6af2c0f834ce156a0bee907ae7335e7b4ef055c845b067ac0c327cabc5` |
| angular-system-log-collection-consistency-master | 5 | `6023544e13d3ee21aab652cc92b31a9a24e6cba2d3c63b2d19d8ec031acc0dfc` |
| angular-system-log-collection-consistency-master | 8 | `93e012929f86efae1c41d1bb5229dc18332bb0ba8c1edd71eacd06812fbb5a5d` |
| angular-system-log-collection-consistency-master | 9 | `8211a083005f754d21dfa0bd936831bb555e61db53028af36cbc795838d56f79` |
| angular-system-log-collection-consistency-api | 1 | `b06ba8cb0ce9db0b852396774e0a816050c4aea473bb32ce287bc4011a0187fa` |
| angular-system-log-collection-consistency-api | 10 | `f58efe9c771befa7aaf5130a56df6fce26a6cea8aa27f40edb6c4155c0b63b54` |
| angular-system-log-collection-consistency-api | 11 | `613af3d9d0b6f6423157ad14b5562c697d985c7fbbd14178956312e386c51898` |
| angular-system-log-collection-consistency-web | 1 | `b06ba8cb0ce9db0b852396774e0a816050c4aea473bb32ce287bc4011a0187fa` |
| angular-system-log-collection-consistency-web | 2 | `f0823b6af2c0f834ce156a0bee907ae7335e7b4ef055c845b067ac0c327cabc5` |
| angular-system-log-collection-consistency-web | 12 | `a86a597260fd56170b6a943f63b37be006e5ad02fa532382cbda79c78e599ec2` |
| angular-system-log-collection-consistency-web | 13 | `42d3611e86b09eb7fc0975ef038314c3fdf6be16d5e850c28f690cd2f05f4565` |
| angular-system-log-collection-consistency-mobile | 1 | `b06ba8cb0ce9db0b852396774e0a816050c4aea473bb32ce287bc4011a0187fa` |
| angular-system-log-collection-consistency-mobile | 14 | `503aebc6934e3972a1fd0b836eaed32d2e63dbab928288e0259882ac99a683b0` |
| angular-system-log-collection-consistency-mobile | 15 | `1b14b0c6c92d9297d61c502029d5716d707e7cf8f4c0e4125190ba178da45518` |
