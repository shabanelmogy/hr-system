<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Shared numeric field preparation Phase 00 - Implementation Preflight

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

- **Shared numeric field preparation cross-platform master review:** `../modules/platform/features/angular-numeric-field-foundation/angular-numeric-field-foundation-review.md` sections 1, 2, 5, 8, 9
- **Shared numeric field preparation API implementation profile:** `../modules/platform/features/angular-numeric-field-foundation/angular-numeric-field-foundation-api.md` sections 1, 10, 11
- **Shared numeric field preparation Next.js implementation profile:** `../modules/platform/features/angular-numeric-field-foundation/angular-numeric-field-foundation-web.md` sections 1, 2, 12, 13
- **Shared numeric field preparation Expo implementation profile:** `../modules/platform/features/angular-numeric-field-foundation/angular-numeric-field-foundation-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-numeric-field-foundation-master | 1 | `d9547b87dad56479ed7a9f5d16a79af3327c020dc429a43ec5b7d28c8181fd70` |
| angular-numeric-field-foundation-master | 2 | `414f2867556665bcb83f2f1ed4794d3185f8f25b5100ebaa9f80e127a10cb98b` |
| angular-numeric-field-foundation-master | 5 | `154795d81507bf30a922336b9c6d501fed92fa3a543520746a1f5b2712a86510` |
| angular-numeric-field-foundation-master | 8 | `cf660dea88733a16bc9c17ce4231c1fba6e5afc89865ef26e10d334ba735be9a` |
| angular-numeric-field-foundation-master | 9 | `ce837fa5be7fa391f4de61e5ec453337c57b3171ba9948aa2f36bebc0ceaf8d0` |
| angular-numeric-field-foundation-api | 1 | `d9547b87dad56479ed7a9f5d16a79af3327c020dc429a43ec5b7d28c8181fd70` |
| angular-numeric-field-foundation-api | 10 | `0bd7827ed769528e2ab4bb6c555c68c6ba376f2c580ed0da78d2aaba1aeae03c` |
| angular-numeric-field-foundation-api | 11 | `c05dd60d5967720bf86a0cf631db3fd61c433ee0edb31e9aacf9fe38cfc97bcc` |
| angular-numeric-field-foundation-web | 1 | `d9547b87dad56479ed7a9f5d16a79af3327c020dc429a43ec5b7d28c8181fd70` |
| angular-numeric-field-foundation-web | 2 | `414f2867556665bcb83f2f1ed4794d3185f8f25b5100ebaa9f80e127a10cb98b` |
| angular-numeric-field-foundation-web | 12 | `70c394f21d68ed7b27d6a603691fc12f698a32daa54587498947440364873013` |
| angular-numeric-field-foundation-web | 13 | `260b6bbb722334d7f00f2ce0e9832a63fff0dce90b143b8ab2bc33d35f62ddf1` |
| angular-numeric-field-foundation-mobile | 1 | `d9547b87dad56479ed7a9f5d16a79af3327c020dc429a43ec5b7d28c8181fd70` |
| angular-numeric-field-foundation-mobile | 14 | `bd0a578158850deda7f804e0a6519f7f46daee3c01352b71847bd16af088ce15` |
| angular-numeric-field-foundation-mobile | 15 | `01d2ce9fe177a828ba7704a0c32938e72850f349533cfcedbfa5736d03335bb4` |
