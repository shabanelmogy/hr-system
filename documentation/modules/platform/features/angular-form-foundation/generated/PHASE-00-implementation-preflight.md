<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Angular Shared Text Fields and Form Submission Phase 00 - Implementation Preflight

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

- **Angular Shared Text Fields and Form Submission cross-platform master review:** `../modules/platform/features/angular-form-foundation/angular-form-foundation-review.md` sections 1, 2, 5, 8, 9
- **Angular Shared Text Fields and Form Submission API implementation profile:** `../modules/platform/features/angular-form-foundation/angular-form-foundation-api.md` sections 1, 10, 11
- **Angular Shared Text Fields and Form Submission Next.js implementation profile:** `../modules/platform/features/angular-form-foundation/angular-form-foundation-web.md` sections 1, 2, 12, 13
- **Angular Shared Text Fields and Form Submission Expo implementation profile:** `../modules/platform/features/angular-form-foundation/angular-form-foundation-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-form-foundation-master | 1 | `3faf7c7e731326a9d26b46946abe7eb9059ff63cb8eec7a8ac2055308cf6fc84` |
| angular-form-foundation-master | 2 | `f2251a944a00c8155b578e2ac7e59625798f5ab536762ef52fd00529ba0982d6` |
| angular-form-foundation-master | 5 | `c6d1c95cb6dfb29c3a4eb08fcf1592391d0d06246967c3fab9725067f8bc2687` |
| angular-form-foundation-master | 8 | `8e9a6c65ec70640c0b36054bd0f77faedfee71f12d1eb28d45398ddfb7365b67` |
| angular-form-foundation-master | 9 | `9e69e079b4dcc5b2ca68cde1376645625bb85e1030a5da4e8083eb9453d322ee` |
| angular-form-foundation-api | 1 | `3faf7c7e731326a9d26b46946abe7eb9059ff63cb8eec7a8ac2055308cf6fc84` |
| angular-form-foundation-api | 10 | `7cef5c81383b73aa3f407c82f8fbd0dd848ef5b67a6e2f0eb8adfb995ec8d14c` |
| angular-form-foundation-api | 11 | `391d65f6b02080f8b4bacf2293b5a07a1aa69f834d784a1d94b4bb86400ee81c` |
| angular-form-foundation-web | 1 | `3faf7c7e731326a9d26b46946abe7eb9059ff63cb8eec7a8ac2055308cf6fc84` |
| angular-form-foundation-web | 2 | `f2251a944a00c8155b578e2ac7e59625798f5ab536762ef52fd00529ba0982d6` |
| angular-form-foundation-web | 12 | `70f10c72924980a36133310b0a7b4dc18511cb110b18323a79dd960adcbc8be3` |
| angular-form-foundation-web | 13 | `d369cbf630d95eb29023602fbe352a2095526c95a1d43009ad38382a265e53c6` |
| angular-form-foundation-mobile | 1 | `3faf7c7e731326a9d26b46946abe7eb9059ff63cb8eec7a8ac2055308cf6fc84` |
| angular-form-foundation-mobile | 14 | `31cf6ca8ba62d489b09c1844f693f761227241e974459440821f57be559bf031` |
| angular-form-foundation-mobile | 15 | `54f8cda59095ce454f27c117ced12176d1875b32cd22697e8b4351e002588c77` |
