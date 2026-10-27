<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Company user permission grants Phase 00 - Implementation Preflight

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

- **Company user permission grants cross-platform master review:** `../modules/platform/features/user-company-permissions/user-company-permissions-review.md` sections 1, 2, 5, 8, 9
- **Company user permission grants API implementation profile:** `../modules/platform/features/user-company-permissions/user-company-permissions-api.md` sections 1, 10, 11
- **Company user permission grants Next.js implementation profile:** `../modules/platform/features/user-company-permissions/user-company-permissions-web.md` sections 1, 2, 12, 13
- **Company user permission grants Expo implementation profile:** `../modules/platform/features/user-company-permissions/user-company-permissions-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| user-company-permissions-master | 1 | `561692f2068bba5d88801db99fa54aa1073ad362e01155cfae7b069ffe3b12c2` |
| user-company-permissions-master | 2 | `2943318c6241f7b16eaf317945cc98bd99284388a7b7ab09d15aac3051f7165c` |
| user-company-permissions-master | 5 | `0a5de5672c9bf63cefc21499e645994b499b01a9999c0563a733feb7a361c039` |
| user-company-permissions-master | 8 | `82e367723ae40c48a6ebd7996337d790ed10c9e178aee51f49ce1038c4a8c896` |
| user-company-permissions-master | 9 | `f84749af9d320ccfd69017091157101cc8697821c62a683ab73a02dfc2e338f6` |
| user-company-permissions-api | 1 | `561692f2068bba5d88801db99fa54aa1073ad362e01155cfae7b069ffe3b12c2` |
| user-company-permissions-api | 10 | `04d729d73d70bbf01c5ab66c715c4e5c10064ab6fab26737d39ed6e021f55c24` |
| user-company-permissions-api | 11 | `0acbafaa9a2b946d6600275b3f89658a487b7f6d6bb0572bf66b2129ecafb633` |
| user-company-permissions-web | 1 | `561692f2068bba5d88801db99fa54aa1073ad362e01155cfae7b069ffe3b12c2` |
| user-company-permissions-web | 2 | `2943318c6241f7b16eaf317945cc98bd99284388a7b7ab09d15aac3051f7165c` |
| user-company-permissions-web | 12 | `3bc15e98a11e24ffdf9d7c1f10ac4cd3f9b57db3f9dadf47c5d9a99d10e6c039` |
| user-company-permissions-web | 13 | `4e889133e082456b5a4c3cd18b0ac78fdd1b875682672183455e445d23826e81` |
| user-company-permissions-mobile | 1 | `561692f2068bba5d88801db99fa54aa1073ad362e01155cfae7b069ffe3b12c2` |
| user-company-permissions-mobile | 14 | `e7d0949a1538a1a1a2f89c390616e73e2a214d79b6a9fcc2db386db070a7e2eb` |
| user-company-permissions-mobile | 15 | `498e787689db01b6c63af622723517cfc79817446fa05d395dcc959ab50b7d0d` |
