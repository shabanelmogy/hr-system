<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Countries managed report integration Phase 00 - Implementation Preflight

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

- **Countries managed report integration cross-platform master review:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-review.md` sections 1, 2, 5, 8, 9
- **Countries managed report integration API implementation profile:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-api.md` sections 1, 10, 11
- **Countries managed report integration Next.js implementation profile:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-web.md` sections 1, 2, 12, 13
- **Countries managed report integration Expo implementation profile:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-report-view-master | 1 | `387934e62c1e0197f4894fc3b143548ac4b5776cbffe763057b6aa3de8a68e59` |
| angular-countries-report-view-master | 2 | `1abd6291624d06e3d1f34333891ca796a9e00f8aa20cacadf888cd301df5a66b` |
| angular-countries-report-view-master | 5 | `43b959cae6bb10e1d9bcf2e172b2478bedb17a95f07dcf801fdebabb55016a2b` |
| angular-countries-report-view-master | 8 | `7b60972b45ea2acdcdca1d0674b119b26fa40d043d89416c6df3796537de9fc8` |
| angular-countries-report-view-master | 9 | `0215aed4368565042ad4967e981f04b00180df8b9b530c8e779be74fb01b3b98` |
| angular-countries-report-view-api | 1 | `387934e62c1e0197f4894fc3b143548ac4b5776cbffe763057b6aa3de8a68e59` |
| angular-countries-report-view-api | 10 | `13d60bdce102af4d3de471b1c12d188b22f6defca177537ecb29b0a236150bca` |
| angular-countries-report-view-api | 11 | `07d4a23ab10ebc939015f30437df95f269e1947926ae9878cceb0fd53cf1d7f2` |
| angular-countries-report-view-web | 1 | `387934e62c1e0197f4894fc3b143548ac4b5776cbffe763057b6aa3de8a68e59` |
| angular-countries-report-view-web | 2 | `1abd6291624d06e3d1f34333891ca796a9e00f8aa20cacadf888cd301df5a66b` |
| angular-countries-report-view-web | 12 | `d00ef73c695843a04a35e438f8baf2757d912e610092d13ab610d3e29eaf9625` |
| angular-countries-report-view-web | 13 | `70cc223c7e0e082bc94d8dc214ce9a5a1cc7d1692876327bd4cf761090c4e345` |
| angular-countries-report-view-mobile | 1 | `387934e62c1e0197f4894fc3b143548ac4b5776cbffe763057b6aa3de8a68e59` |
| angular-countries-report-view-mobile | 14 | `dd66464a591dcdb36b27d479b433ff9c893b83e74dfb2f3b93099c11b1bb1775` |
| angular-countries-report-view-mobile | 15 | `77e437514d564ff8e9a24ba924f71ab6918acd8ba106c5c08f9577b533b90aa7` |
