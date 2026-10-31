<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Angular API contract generation compatibility proof Phase 00 - Implementation Preflight

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

- **Angular API contract generation compatibility proof cross-platform master review:** `../modules/platform/features/angular-api-contract-generation-proof/angular-api-contract-generation-proof-review.md` sections 1, 2, 5, 8, 9
- **Angular API contract generation compatibility proof API implementation profile:** `../modules/platform/features/angular-api-contract-generation-proof/angular-api-contract-generation-proof-api.md` sections 1, 10, 11
- **Angular API contract generation compatibility proof Next.js implementation profile:** `../modules/platform/features/angular-api-contract-generation-proof/angular-api-contract-generation-proof-web.md` sections 1, 2, 12, 13
- **Angular API contract generation compatibility proof Expo implementation profile:** `../modules/platform/features/angular-api-contract-generation-proof/angular-api-contract-generation-proof-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-api-contract-generation-proof-master | 1 | `05a1c635c46a3eb0792ec73846b7b313dce0ca8097d044fb38c678d39c1eb44c` |
| angular-api-contract-generation-proof-master | 2 | `4175488691af7b51b1d42a1ee43d8077207c2229d6575324f6ef899e2d6c3501` |
| angular-api-contract-generation-proof-master | 5 | `49afe2bb4db3fac02f1d86edf857f1f97125d58e1c256407a86f861ded5c87e7` |
| angular-api-contract-generation-proof-master | 8 | `fd292d3cec432f44bb98aceb506aa1d3f871da0aed1f145d4b1ce14bcd82c541` |
| angular-api-contract-generation-proof-master | 9 | `78ce449fad32387d28b10ac190a7b24314efa780388f75ebc4f3cd34c045783e` |
| angular-api-contract-generation-proof-api | 1 | `05a1c635c46a3eb0792ec73846b7b313dce0ca8097d044fb38c678d39c1eb44c` |
| angular-api-contract-generation-proof-api | 10 | `90e4bcdbf79b13aab5307175b41a047870abb2e21b858362cb7abed7fb17ffab` |
| angular-api-contract-generation-proof-api | 11 | `d7e05edb39ab6b7b9b9545940088a607a8d779f955d7fba4b7ae748bdf8c6e4d` |
| angular-api-contract-generation-proof-web | 1 | `05a1c635c46a3eb0792ec73846b7b313dce0ca8097d044fb38c678d39c1eb44c` |
| angular-api-contract-generation-proof-web | 2 | `4175488691af7b51b1d42a1ee43d8077207c2229d6575324f6ef899e2d6c3501` |
| angular-api-contract-generation-proof-web | 12 | `0a0dddd7214cdaa5198c2c9aeb62d830042248f156d067d10f2f4f28891930f5` |
| angular-api-contract-generation-proof-web | 13 | `8eb209af489cfe780f83e4f1313815475d5f669a5d0b2aee6aab18ab9a4c5edf` |
| angular-api-contract-generation-proof-mobile | 1 | `05a1c635c46a3eb0792ec73846b7b313dce0ca8097d044fb38c678d39c1eb44c` |
| angular-api-contract-generation-proof-mobile | 14 | `ee5c674e759613eaceb91f95f1e6d561b134004a915a257ee94ae1b4507e052c` |
| angular-api-contract-generation-proof-mobile | 15 | `7a363919fa6d3783cc9f713d10f73ad3f5a91d68eabafbce13e95232c0a0ed0b` |
