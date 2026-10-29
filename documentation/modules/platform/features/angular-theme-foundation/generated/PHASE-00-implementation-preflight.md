<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Angular Shared Theme and Action Control Phase 00 - Implementation Preflight

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

- **Angular Shared Theme and Action Control cross-platform master review:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-review.md` sections 1, 2, 5, 8, 9
- **Angular Shared Theme and Action Control API implementation profile:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-api.md` sections 1, 10, 11
- **Angular Shared Theme and Action Control Next.js implementation profile:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-web.md` sections 1, 2, 12, 13
- **Angular Shared Theme and Action Control Expo implementation profile:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-theme-foundation-master | 1 | `350106b9d165927fccfe97ada1dd90dfe9128de5f0076e9a95a6bcef39eb9c44` |
| angular-theme-foundation-master | 2 | `23ebd67dc023b93e3fe4b46bf2d361346ae97d9e9e774aa289e82f4ec0584f7b` |
| angular-theme-foundation-master | 5 | `a866a4bf9fdc929bfb990a70fe575bfc962a4097a68f81e636044e80f620d8d1` |
| angular-theme-foundation-master | 8 | `ea5867fdb4129cd10c2ee5662de83461d5cad88059d0057d0977147a1f1c022d` |
| angular-theme-foundation-master | 9 | `5291c967ab5ed5d278ffe583e1ff21d682be39afc96fb69800728b7da653b36b` |
| angular-theme-foundation-api | 1 | `350106b9d165927fccfe97ada1dd90dfe9128de5f0076e9a95a6bcef39eb9c44` |
| angular-theme-foundation-api | 10 | `62ccb5d14f2b568616a3cf694d0418404fd96766ba7ca2f3a10538da44834953` |
| angular-theme-foundation-api | 11 | `58dc115e8092bcba8eba15cea9974b490796f1bb79ea8dcb5f57f9f9083b5e13` |
| angular-theme-foundation-web | 1 | `350106b9d165927fccfe97ada1dd90dfe9128de5f0076e9a95a6bcef39eb9c44` |
| angular-theme-foundation-web | 2 | `23ebd67dc023b93e3fe4b46bf2d361346ae97d9e9e774aa289e82f4ec0584f7b` |
| angular-theme-foundation-web | 12 | `1551bbf6ddbdcd426aa3759d7ced8fdf0a303c7a5143aba86a4c6e5870592c4b` |
| angular-theme-foundation-web | 13 | `13bc8ce32880ebc4901c2ccf67f921e1a34fcffa5dbb2bf3f3e08566adaa8a61` |
| angular-theme-foundation-mobile | 1 | `350106b9d165927fccfe97ada1dd90dfe9128de5f0076e9a95a6bcef39eb9c44` |
| angular-theme-foundation-mobile | 14 | `b654c4c4e8ade2d5e7f21a434b4c89913a1dc05ce33ff6113fbe7b0510cc1f22` |
| angular-theme-foundation-mobile | 15 | `352a451bf107a65df616afa4f9d3d8396b7bfa7bd25b5f00b26f68687a0319ba` |
