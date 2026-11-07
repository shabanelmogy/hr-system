<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Shared all-filtered Excel and CSV export Phase 00 - Implementation Preflight

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

- **Shared all-filtered Excel and CSV export cross-platform master review:** `../modules/platform/features/angular-collection-export/angular-collection-export-review.md` sections 1, 2, 5, 8, 9
- **Shared all-filtered Excel and CSV export API implementation profile:** `../modules/platform/features/angular-collection-export/angular-collection-export-api.md` sections 1, 10, 11
- **Shared all-filtered Excel and CSV export Next.js implementation profile:** `../modules/platform/features/angular-collection-export/angular-collection-export-web.md` sections 1, 2, 12, 13
- **Shared all-filtered Excel and CSV export Expo implementation profile:** `../modules/platform/features/angular-collection-export/angular-collection-export-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-collection-export-master | 1 | `c2ae1e2e446357c72bca84b940abd1b4a0c72d7492c8c1a325709eaf3474df2f` |
| angular-collection-export-master | 2 | `3d4d1cccf9731878c83a180ea9cf3da19bc60b22638d9ca80429936b688d972c` |
| angular-collection-export-master | 5 | `2848d51a90cc824caaf3a08b86ab5b84e0fcb9f3ff0e57d8c8564e57c052fcb7` |
| angular-collection-export-master | 8 | `2bd7cae6c908f53e4d96af362446cc66c27886f0a5c931fff2193898b3c39b30` |
| angular-collection-export-master | 9 | `0314d42449a9d815704ec1cae9e1b9a83cdc2fd19c9822997852028d23c15113` |
| angular-collection-export-api | 1 | `c2ae1e2e446357c72bca84b940abd1b4a0c72d7492c8c1a325709eaf3474df2f` |
| angular-collection-export-api | 10 | `d1edf745c381758e648f1843d464426c2fdbb943b90ae1d70f8e0c2e7583ac2d` |
| angular-collection-export-api | 11 | `be1f78514e46607c9b87c07d2f3512c055e814008c906d57690f5c96bbc11a4a` |
| angular-collection-export-web | 1 | `c2ae1e2e446357c72bca84b940abd1b4a0c72d7492c8c1a325709eaf3474df2f` |
| angular-collection-export-web | 2 | `3d4d1cccf9731878c83a180ea9cf3da19bc60b22638d9ca80429936b688d972c` |
| angular-collection-export-web | 12 | `ba0b2122f3a968f88a94c47f3a7c139acec2450c3fff68b282c846bf5e4e9201` |
| angular-collection-export-web | 13 | `55b050a45687faf98ffdae6c1e861adedf4af7806a6984385063f1574191dd04` |
| angular-collection-export-mobile | 1 | `c2ae1e2e446357c72bca84b940abd1b4a0c72d7492c8c1a325709eaf3474df2f` |
| angular-collection-export-mobile | 14 | `ceb7eed7e891ef5e995670ebd004160eaf1bdb2f13844b26e9409dfdeda6d173` |
| angular-collection-export-mobile | 15 | `c6f23a863122898d678aee894212a77e203a6b299b7e7d345794c47d1265cfc6` |
