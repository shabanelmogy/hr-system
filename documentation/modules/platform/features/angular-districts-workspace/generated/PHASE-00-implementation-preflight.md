<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Districts complete Angular parity Phase 00 - Implementation Preflight

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

- **Districts complete Angular parity cross-platform master review:** `../modules/platform/features/angular-districts-workspace/angular-districts-workspace-review.md` sections 1, 2, 5, 8, 9
- **Districts complete Angular parity API implementation profile:** `../modules/platform/features/angular-districts-workspace/angular-districts-workspace-api.md` sections 1, 10, 11
- **Districts complete Angular parity Next.js implementation profile:** `../modules/platform/features/angular-districts-workspace/angular-districts-workspace-web.md` sections 1, 2, 12, 13
- **Districts complete Angular parity Expo implementation profile:** `../modules/platform/features/angular-districts-workspace/angular-districts-workspace-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-districts-workspace-master | 1 | `5176ad728f2b766909a09a9cee5adea81c633bb270bcd26279a4b4a9754fcadc` |
| angular-districts-workspace-master | 2 | `7d3cdde508cc1fd64be7f337a3a3f1f9ad27e94ebbfe12465578ca7df367d84c` |
| angular-districts-workspace-master | 5 | `83ee8d058bd1852919a3b4e1e552e737c4d8dccf327cd57d07603025aefb2735` |
| angular-districts-workspace-master | 8 | `6b0affc4f5a9229dcc500e114b0b37d60b52eb819ec6219986706b3957ba65fb` |
| angular-districts-workspace-master | 9 | `db4b325ac4030e9da6b16e3f937c8e096cb382b7d0237821d04ba61450a5923f` |
| angular-districts-workspace-api | 1 | `5176ad728f2b766909a09a9cee5adea81c633bb270bcd26279a4b4a9754fcadc` |
| angular-districts-workspace-api | 10 | `238aaba6b3f40c39dc608844d96971c0a35368f7cc1da44450383e2fadd8b0ba` |
| angular-districts-workspace-api | 11 | `61b0f90a550f98e596889d1ca889cdd0884d8b101d9d1a467eac82f7e358f7f7` |
| angular-districts-workspace-web | 1 | `5176ad728f2b766909a09a9cee5adea81c633bb270bcd26279a4b4a9754fcadc` |
| angular-districts-workspace-web | 2 | `7d3cdde508cc1fd64be7f337a3a3f1f9ad27e94ebbfe12465578ca7df367d84c` |
| angular-districts-workspace-web | 12 | `4e82a4b1fadb9cbe32c1a20f1c2f8928e6d5862e62e693d862aff3ac8d215234` |
| angular-districts-workspace-web | 13 | `3a83a7e85c9fb6480acffddc41e7d131bf60e191698e901ba53e2311999d0e68` |
| angular-districts-workspace-mobile | 1 | `5176ad728f2b766909a09a9cee5adea81c633bb270bcd26279a4b4a9754fcadc` |
| angular-districts-workspace-mobile | 14 | `6a476e0065abe39a88ff42c5d854d9bb96f4fce3e0bda6325221c6801001a576` |
| angular-districts-workspace-mobile | 15 | `418f1e8e5d2c6eb6de865f9043da23515ea3884d566bc8212780c4e764271ee6` |
