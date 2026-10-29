<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Angular Password Sign-in and Session Entry Phase 00 - Implementation Preflight

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

- **Angular Password Sign-in and Session Entry cross-platform master review:** `../modules/platform/features/angular-password-sign-in/angular-password-sign-in-review.md` sections 1, 2, 5, 8, 9
- **Angular Password Sign-in and Session Entry API implementation profile:** `../modules/platform/features/angular-password-sign-in/angular-password-sign-in-api.md` sections 1, 10, 11
- **Angular Password Sign-in and Session Entry Next.js implementation profile:** `../modules/platform/features/angular-password-sign-in/angular-password-sign-in-web.md` sections 1, 2, 12, 13
- **Angular Password Sign-in and Session Entry Expo implementation profile:** `../modules/platform/features/angular-password-sign-in/angular-password-sign-in-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-password-sign-in-master | 1 | `4d04517f7c89c559c891a7a8b66307fc8c056b2b55263b7f2320af01a707a662` |
| angular-password-sign-in-master | 2 | `afd865510b9657196a4e70f2a940fb71485b8e7c71268f84cfe9c5cc65a8fc86` |
| angular-password-sign-in-master | 5 | `16451bc961f142c6a8c1c431ff6c340da11492ea5f23843de448ef5b3d3dafcb` |
| angular-password-sign-in-master | 8 | `20bb0006bf41335f8388d59ee615c62130b86c47d6054816da5b6ffffcd1ef4f` |
| angular-password-sign-in-master | 9 | `1c4d78b720a7cdf945b7660d390d8dc8231cdb31b67d5839949dd89d27c6741e` |
| angular-password-sign-in-api | 1 | `4d04517f7c89c559c891a7a8b66307fc8c056b2b55263b7f2320af01a707a662` |
| angular-password-sign-in-api | 10 | `ca3239d03a84ac7440b0a9d7d9bb7a9b26160ab88f976e7084951110f8210966` |
| angular-password-sign-in-api | 11 | `8f2747a1bf5b7e3f1e11ec31e6c8a1b54fe7662515d3e2e7898496e12230cda5` |
| angular-password-sign-in-web | 1 | `4d04517f7c89c559c891a7a8b66307fc8c056b2b55263b7f2320af01a707a662` |
| angular-password-sign-in-web | 2 | `afd865510b9657196a4e70f2a940fb71485b8e7c71268f84cfe9c5cc65a8fc86` |
| angular-password-sign-in-web | 12 | `e1236d5a6672c5efd5942f0d28c5e0e3f2a91e52ed676c1ffa4ea9c514dad1b1` |
| angular-password-sign-in-web | 13 | `6579caaa1aa7b33f80bcd9dc58af531a38a3bfc4e7b4d4eb7490ef3342106645` |
| angular-password-sign-in-mobile | 1 | `4d04517f7c89c559c891a7a8b66307fc8c056b2b55263b7f2320af01a707a662` |
| angular-password-sign-in-mobile | 14 | `dd02cbcbb56b2a58649f3ea4d90dfdedb6059d2ed8bfa6c6cdb25f495640158e` |
| angular-password-sign-in-mobile | 15 | `2b1aa65c0089e0b2fd7fa5aa8927a32302817184b8b90cc6403f9c0091213480` |
