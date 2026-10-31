<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Shared unsaved navigation and context protection preparation Phase 00 - Implementation Preflight

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

- **Shared unsaved navigation and context protection preparation cross-platform master review:** `../modules/platform/features/angular-unsaved-navigation-foundation/angular-unsaved-navigation-foundation-review.md` sections 1, 2, 5, 8, 9
- **Shared unsaved navigation and context protection preparation API implementation profile:** `../modules/platform/features/angular-unsaved-navigation-foundation/angular-unsaved-navigation-foundation-api.md` sections 1, 10, 11
- **Shared unsaved navigation and context protection preparation Next.js implementation profile:** `../modules/platform/features/angular-unsaved-navigation-foundation/angular-unsaved-navigation-foundation-web.md` sections 1, 2, 12, 13
- **Shared unsaved navigation and context protection preparation Expo implementation profile:** `../modules/platform/features/angular-unsaved-navigation-foundation/angular-unsaved-navigation-foundation-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-unsaved-navigation-foundation-master | 1 | `7c5159891c1b522f39583996cc03b89d729ab2601de7c28da4cd09a58db4decb` |
| angular-unsaved-navigation-foundation-master | 2 | `79e5a97f176aa796f1eafec856bbc2fef44fe4e15909fc9e9a4af11a081d9bdd` |
| angular-unsaved-navigation-foundation-master | 5 | `a0d875b6c17ba506eff2ec67858ddf6be03398c262c294ffb637a058e753f9b9` |
| angular-unsaved-navigation-foundation-master | 8 | `102e05d9052cbe150f9838d835dcf3236fb078cddb9870e1026195410c01f87e` |
| angular-unsaved-navigation-foundation-master | 9 | `3a1057f037bc3b51ed5b9a18e3318ae5af9cc03b192c60d47ef3a5b817d786aa` |
| angular-unsaved-navigation-foundation-api | 1 | `7c5159891c1b522f39583996cc03b89d729ab2601de7c28da4cd09a58db4decb` |
| angular-unsaved-navigation-foundation-api | 10 | `0b1dd9dc51445c019adb6e53cf01354dd7c27ad536b2fb307472c04731833c0e` |
| angular-unsaved-navigation-foundation-api | 11 | `a14108c59792851a8cf0b396c902cc0a064767ad61a7804cdf0b8376b3d983c6` |
| angular-unsaved-navigation-foundation-web | 1 | `7c5159891c1b522f39583996cc03b89d729ab2601de7c28da4cd09a58db4decb` |
| angular-unsaved-navigation-foundation-web | 2 | `79e5a97f176aa796f1eafec856bbc2fef44fe4e15909fc9e9a4af11a081d9bdd` |
| angular-unsaved-navigation-foundation-web | 12 | `e8cb9f856bb8cd95cf5c75447012220d34af46d584c29d89ff9e3a5a11a40308` |
| angular-unsaved-navigation-foundation-web | 13 | `8ee5f72106aec53e2875658413ddfe630ec0c6e0d8a37b120ee2a37ae855a47f` |
| angular-unsaved-navigation-foundation-mobile | 1 | `7c5159891c1b522f39583996cc03b89d729ab2601de7c28da4cd09a58db4decb` |
| angular-unsaved-navigation-foundation-mobile | 14 | `b32771bea01c613dd5d8b0595a903084951c2146a7146887cd42ce88a7d72107` |
| angular-unsaved-navigation-foundation-mobile | 15 | `6554f82533c72d75042157b056e43d7f2961f64ac7446de21fb78f79bf50a49d` |
