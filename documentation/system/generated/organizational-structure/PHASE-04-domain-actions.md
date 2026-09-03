<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Organizational Structure Phase 04 - Domain Actions and Lifecycle

## Purpose

Reconcile every lifecycle action across API, browser, and mobile before considering the feature complete.

## Action ledger

For create, bulk create, edit, archive, restore, bulk archive, import, report, and child-management actions, record:

- Permission and read-only requirements.
- Eligible entity states and relationship guards.
- Confirmation and dirty-exit behavior.
- Request shape, normalization, validation, and maximum batch size.
- Transaction boundary, audit record, background job, notification, and realtime behavior.
- Shared concurrency resource/constraint for every dependency predicate, including
  all parent, child, restore, move, and bulk participants plus lock ordering.
- Cache invalidation and list-selection cleanup in both clients.
- Success, partial failure, all-or-nothing, idempotent, and retry outcomes.

## Exit checks

- [ ] UI visibility is not the only authorization boundary.
- [ ] Archived records cannot enter active-only flows.
- [ ] Restore behavior is explicit and tested.
- [ ] Bulk operations do not silently ignore invalid or duplicated identifiers.
- [ ] Client bulk selection cannot exceed the API maximum; oversized selection is
      rejected with feedback and the direct submit path rechecks it.
- [ ] Parent/child lifecycle races are tested or otherwise proven at the database
      boundary; isolated handler prechecks are not accepted as concurrency proof.
- [ ] Required Import distinguishes local-invalid rows from the submitted batch,
      states whether the submitted batch is atomic, and never reports partial
      success unless the API contract explicitly supports it.
- [ ] Import validates client limits before submitting and the API independently enforces its own limits.
- [ ] Import duplicate checks are field- and scope-specific, relationship lookups
      are explicit, retry behavior is safe, and any rejected-row download is
      separately classified as Required, Deferred, or Excluded.
- [ ] Client feedback uses stable server errors and localized fallback messages.

## Evidence to capture

For every action, record one row linking its direct client handler, permission
guard, API request, handler, transaction boundary, side-effect action, query-key
invalidation, success test, and failure test. Use `N/A` only with a reason.

## Approved references

- **Organizational Structure cross-platform master review:** `../project/ORGANIZATIONAL_STRUCTURE_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7, 8
- **Organizational Structure API implementation profile:** `../api/OrganizationalStructure_API_Implementation_Profile.md` sections 6, 7, 8
- **Organizational Structure Next.js implementation profile:** `../web-next/features/organizational-structure-frontend-reference.md` sections 6, 7, 8, 9
- **Organizational Structure Expo implementation profile:** `../mobile-react/organizational-structure-mobile-reference.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| organizational-structure-master | 3 | `e45c90794d15330609e089c888b6a6af9df12bcf5a265e1f78d93e31f39b8a8c` |
| organizational-structure-master | 4 | `0beaf7376a09bb7c622523a47042700f05bf8105485ff4f3fda6be4ed287136a` |
| organizational-structure-master | 6 | `2fdee62992580c5d76fc63348edf52701b1e514b1c18ff8be30c53dda4d1b0bf` |
| organizational-structure-master | 7 | `d3371766bde33eeaa333e5abee156d13b95e6c35dae25ecc9ca097037434c07c` |
| organizational-structure-master | 8 | `2d14109ce3bb4835c1ac94307acaf5e892e36ded76f27395197546348229812d` |
| organizational-structure-api | 6 | `329fee341e7ab5c423c4e623c155555d646e9de947783e8c8a2bb2d412f46a60` |
| organizational-structure-api | 7 | `e9a1bfce24a2a28512423c5054e85e1bdc1639698cad086cf1cf99e3b5d2d939` |
| organizational-structure-api | 8 | `8427fbc60b6506434f168bbb92cebc0b07e6699dec5f0c7e336d6b0c7906c32a` |
| organizational-structure-web | 6 | `9f3ee2ec7f93eca74063e2e7bd940a416c741f9f673c1dcf4ec87f91b8b1f5ea` |
| organizational-structure-web | 7 | `8079e625c2cff443433359be277baccfd39cd512dd3cffd356e5b934d31637b2` |
| organizational-structure-web | 8 | `81709390ab5691f03acc9dcd2b845f95f2a60c0ee2707ea8d96dcfc4efd4d812` |
| organizational-structure-web | 9 | `e927d61cfecd602bd6ef280ad83f12cd1a9615a5e9753963a89f8cc8e4dd2033` |
| organizational-structure-mobile | 9 | `a81ab1f68c57c31f0a4a4e83b9a035b17676c9c8098b2ab3ce74e33b1323c466` |
| organizational-structure-mobile | 10 | `a63acd8c39188f4d933e677680fde79c2170aa45afe71c8cf4b896109c5bc06c` |
| organizational-structure-mobile | 11 | `ec3e51c2ef99a1494eb03474652b596423e1d5fcc07a4ad7cf8066b0517e1b4e` |
