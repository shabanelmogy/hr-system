<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Countries complete Angular pilot acceptance Phase 00 - Implementation Preflight

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

- **Countries complete Angular pilot acceptance cross-platform master review:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-review.md` sections 1, 2, 5, 8, 9
- **Countries complete Angular pilot acceptance API implementation profile:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-api.md` sections 1, 10, 11
- **Countries complete Angular pilot acceptance Angular implementation profile:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-web.md` sections 1, 2, 12, 13
- **Countries complete Angular pilot acceptance Expo implementation profile:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-pilot-acceptance-master | 1 | `0b2c7ed5cc1ef80ae8fa8f8e9d2f129f3a59bf7494eee903899b7277aec4a593` |
| angular-countries-pilot-acceptance-master | 2 | `ea0dc7b76fda8e4ee98b7c589360cd11bb762f4ec1d56ab9e34a291b2f8e3f28` |
| angular-countries-pilot-acceptance-master | 5 | `0aa6952a87771c8a709da41f5b1a7175e04ded9b8b5e5920427a65f6ae684b29` |
| angular-countries-pilot-acceptance-master | 8 | `8ff9f73d158c003b1de9fa565cc3db69c532b5fa764765f86113ecc3c93907f6` |
| angular-countries-pilot-acceptance-master | 9 | `cfd45c94e6f6655bf42151bf457b3a824ed4ea45c44bc9133a0b327d6f1c70f2` |
| angular-countries-pilot-acceptance-api | 1 | `0b2c7ed5cc1ef80ae8fa8f8e9d2f129f3a59bf7494eee903899b7277aec4a593` |
| angular-countries-pilot-acceptance-api | 10 | `62c2258966b5f7bbae277f33d4fdec00a34d1794d5e048e1c3c2a80d3e237a0d` |
| angular-countries-pilot-acceptance-api | 11 | `3b0cabe8ab97271623de5609958e813cb83d4e8f541a6df72ceaf998c45be342` |
| angular-countries-pilot-acceptance-web | 1 | `0b2c7ed5cc1ef80ae8fa8f8e9d2f129f3a59bf7494eee903899b7277aec4a593` |
| angular-countries-pilot-acceptance-web | 2 | `ea0dc7b76fda8e4ee98b7c589360cd11bb762f4ec1d56ab9e34a291b2f8e3f28` |
| angular-countries-pilot-acceptance-web | 12 | `29cc9094f8ae850c869bf087552f94ba1be462fa35e37c3fd73c6092bf3e1b3b` |
| angular-countries-pilot-acceptance-web | 13 | `9966dbeaa235bbbbfeef2d945a6b229644b05050df48a7fc67067bbc73f18f4f` |
| angular-countries-pilot-acceptance-mobile | 1 | `ac974c3c03e926da01e2cd4d70e2125344d33c35cf4cbbe739984e28e2cc1b51` |
| angular-countries-pilot-acceptance-mobile | 14 | `dc05defa17ba25d72477b2ca71aa85ff3c51323a8992c47aad376452d0053750` |
| angular-countries-pilot-acceptance-mobile | 15 | `8da7404d2323ae2e158b4f744ce85ada57c5fed0ed0eeaf6b5446ea4c4d841f1` |
