<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Super Admin Tenant Management parity Phase 00 - Implementation Preflight

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

- **Super Admin Tenant Management parity cross-platform master review:** `../modules/platform/features/angular-tenant-management-workspace/angular-tenant-management-workspace-review.md` sections 1, 2, 5, 8, 9
- **Super Admin Tenant Management parity API implementation profile:** `../modules/platform/features/angular-tenant-management-workspace/angular-tenant-management-workspace-api.md` sections 1, 10, 11
- **Super Admin Tenant Management parity Next.js implementation profile:** `../modules/platform/features/angular-tenant-management-workspace/angular-tenant-management-workspace-web.md` sections 1, 2, 12, 13
- **Super Admin Tenant Management parity Expo implementation profile:** `../modules/platform/features/angular-tenant-management-workspace/angular-tenant-management-workspace-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-tenant-management-workspace-master | 1 | `4edcbb7e804a43c881fb8e1fa0dcc2576a683b564539c6965199ac037b369e01` |
| angular-tenant-management-workspace-master | 2 | `5d5148783b2f425f0e3e3e3c42dbd48d26fb3e98f94c166c22522c7c524aef03` |
| angular-tenant-management-workspace-master | 5 | `ee9bc37eb15254f22e8455323842b5697103b386156ec607241960ab622be4d9` |
| angular-tenant-management-workspace-master | 8 | `4dd2d9d16d634d5b10a07cee974304b25582a87f5f5cda75232b0a547569ea1b` |
| angular-tenant-management-workspace-master | 9 | `aea4c445078d632d1cf855287b49de312c5b558bdd3445fafec0d79842b18490` |
| angular-tenant-management-workspace-api | 1 | `4edcbb7e804a43c881fb8e1fa0dcc2576a683b564539c6965199ac037b369e01` |
| angular-tenant-management-workspace-api | 10 | `02c4d5b980a26d07c1d41aa0235b40c3775f2e3a1295ee3e632106610d4545c2` |
| angular-tenant-management-workspace-api | 11 | `53250fa797569e411e501724b0610d4ed1e4597f93355b69546d6d962b58cd76` |
| angular-tenant-management-workspace-web | 1 | `4edcbb7e804a43c881fb8e1fa0dcc2576a683b564539c6965199ac037b369e01` |
| angular-tenant-management-workspace-web | 2 | `5d5148783b2f425f0e3e3e3c42dbd48d26fb3e98f94c166c22522c7c524aef03` |
| angular-tenant-management-workspace-web | 12 | `f8dea0b4b8b8eb17213011dba17e5ca41bad1a14640514f71e3bd29587c9bf3c` |
| angular-tenant-management-workspace-web | 13 | `fbf279b1c25c631dc60900c20f12a63d5e2a0d213572f799133bb8c371f74260` |
| angular-tenant-management-workspace-mobile | 1 | `4edcbb7e804a43c881fb8e1fa0dcc2576a683b564539c6965199ac037b369e01` |
| angular-tenant-management-workspace-mobile | 14 | `7059d89c8935afdd4cf459290b7ad6d106828553a6e7fbbd720bd588ad3c5556` |
| angular-tenant-management-workspace-mobile | 15 | `c96f0d545088658f442ac4dd2872d9f36bb7c9315accd2793c7c4c1932d257af` |
