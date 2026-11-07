<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Angular own account profile and password parity Phase 00 - Implementation Preflight

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

- **Angular own account profile and password parity cross-platform master review:** `../modules/platform/features/angular-account-profile/angular-account-profile-review.md` sections 1, 2, 5, 8, 9
- **Angular own account profile and password parity API implementation profile:** `../modules/platform/features/angular-account-profile/angular-account-profile-api.md` sections 1, 10, 11
- **Angular own account profile and password parity Next.js implementation profile:** `../modules/platform/features/angular-account-profile/angular-account-profile-web.md` sections 1, 2, 12, 13
- **Angular own account profile and password parity Expo implementation profile:** `../modules/platform/features/angular-account-profile/angular-account-profile-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-account-profile-master | 1 | `89e0924048c257f87c1a1f6dad3171a993d1f5200e99417495dd946d9f65d652` |
| angular-account-profile-master | 2 | `bfb78175fbe402cb053511ba9ba207d41b46b9698537ec1f2615a488b5a9610a` |
| angular-account-profile-master | 5 | `1205ea31f7ea3ffc38e298c7be619e6daeaa93b586ef5b14fac32712876ab545` |
| angular-account-profile-master | 8 | `217c42df40f14da6354dd45e279666c1c3af648d1665b0113ce955218239da2c` |
| angular-account-profile-master | 9 | `7da0be7c93de6bc7dc0ced4ee57e36358b8187f85dc0d1ec8983a7d092e0ecef` |
| angular-account-profile-api | 1 | `07e0d48b145ebcb831af7a219120ae82ba579cded649137f3c5f067d4725703b` |
| angular-account-profile-api | 10 | `39a850bc1222626cc35fa79f92f2e7bdf4fa4bdc9ee114f980916a360cd7c9c7` |
| angular-account-profile-api | 11 | `3d60854da95f72fe018752e50ebfce0a9ba39e07b1f5acddb26ce1af7d17a2db` |
| angular-account-profile-web | 1 | `66964aded8e74a94565183d9bf23e3567b47fc61b7ca460fcc50141fb6c91073` |
| angular-account-profile-web | 2 | `2fd14971af9953ff7b7ccf1b8dbed62a944f756a3ff5e8f0ddaafbeac50be11d` |
| angular-account-profile-web | 12 | `99b54362d762e2babc6d5c1bd7a16a6f871c272dd0586f698867dda12c4eb3de` |
| angular-account-profile-web | 13 | `000e67480aa90c1fb7a36a8318e5f81cb7439ec0b10646d4c7c145c5584a2726` |
| angular-account-profile-mobile | 1 | `ad60c52bf84e3d80009d20726ae948daacb1be8fc9d0b2b7da1e691c59aeb6e3` |
| angular-account-profile-mobile | 14 | `eb871b8e27225fbb02a87b7705d5b2d02b78b3b319e4ec0a0e57314fbf5e62e6` |
| angular-account-profile-mobile | 15 | `03132b882cadf2168d6fc45cb37f61c9c53c20f540719ce66683b9ccf1e3758b` |
