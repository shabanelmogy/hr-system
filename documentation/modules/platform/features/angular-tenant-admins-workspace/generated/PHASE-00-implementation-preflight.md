<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Super Admin Tenant Administrators parity Phase 00 - Implementation Preflight

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

- **Super Admin Tenant Administrators parity cross-platform master review:** `../modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-review.md` sections 1, 2, 5, 8, 9
- **Super Admin Tenant Administrators parity API implementation profile:** `../modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-api.md` sections 1, 10, 11
- **Super Admin Tenant Administrators parity Next.js implementation profile:** `../modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-web.md` sections 1, 2, 12, 13
- **Super Admin Tenant Administrators parity Expo implementation profile:** `../modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-tenant-admins-workspace-master | 1 | `059b48fa0b389f7a89dd01463313ba0c1db2772d2b10defb8630096f571c0ee8` |
| angular-tenant-admins-workspace-master | 2 | `99920dbd79c8c9d191ef7c37a64abf24af13da54217b04b7dfd0328f44590f86` |
| angular-tenant-admins-workspace-master | 5 | `7e28de741932b6bec4bbec7f955d1734316c5b5a58bd5ab6f82944ec6a4c22db` |
| angular-tenant-admins-workspace-master | 8 | `1e18636edbe60a282f77f2ab441b85f2359c9ea6051fabca7360c592e925719f` |
| angular-tenant-admins-workspace-master | 9 | `9fc33d645ccd7ddc8a3900ab3265c732e553c5894ab8e2219f201cfe91081800` |
| angular-tenant-admins-workspace-api | 1 | `059b48fa0b389f7a89dd01463313ba0c1db2772d2b10defb8630096f571c0ee8` |
| angular-tenant-admins-workspace-api | 10 | `9d9e0e66e19ccb5487a50d725ad157fc49323d97f3e1bc6fd76370ffb0429bb3` |
| angular-tenant-admins-workspace-api | 11 | `3184a5fcf173d6e35813758be2a5dac2f5597db2363e9d87eb85cd51d2da6fb3` |
| angular-tenant-admins-workspace-web | 1 | `059b48fa0b389f7a89dd01463313ba0c1db2772d2b10defb8630096f571c0ee8` |
| angular-tenant-admins-workspace-web | 2 | `99920dbd79c8c9d191ef7c37a64abf24af13da54217b04b7dfd0328f44590f86` |
| angular-tenant-admins-workspace-web | 12 | `5aa0ce96abf130008a81a0ba63b07ef8c7fadb966cd3d8a16b285f45d2b5edb8` |
| angular-tenant-admins-workspace-web | 13 | `2326725837a66e7d8ef635069758f4f59db053ad4033da25ee4a5e5bc857537e` |
| angular-tenant-admins-workspace-mobile | 1 | `059b48fa0b389f7a89dd01463313ba0c1db2772d2b10defb8630096f571c0ee8` |
| angular-tenant-admins-workspace-mobile | 14 | `601548b18d59a0599c14e05d8255325957e1adfce88f89a67a0605b2cbbb53ad` |
| angular-tenant-admins-workspace-mobile | 15 | `02a57254ef009d0a91c8e06a109bc0b76c9bfb52ebdfd97976ec9cf4c1bebc4b` |
