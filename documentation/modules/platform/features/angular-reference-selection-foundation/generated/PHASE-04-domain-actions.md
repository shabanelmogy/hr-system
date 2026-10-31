<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Angular shared reference selection foundation Phase 04 - Domain Actions and Lifecycle

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

- **Angular shared reference selection foundation cross-platform master review:** `../modules/platform/features/angular-reference-selection-foundation/angular-reference-selection-foundation-review.md` sections 3, 4, 6, 7, 8
- **Angular shared reference selection foundation API implementation profile:** `../modules/platform/features/angular-reference-selection-foundation/angular-reference-selection-foundation-api.md` sections 6, 7, 8
- **Angular shared reference selection Web implementation profile:** `../modules/platform/features/angular-reference-selection-foundation/angular-reference-selection-foundation-web.md` sections 6, 7, 8, 9
- **Angular shared reference selection foundation Expo implementation profile:** `../modules/platform/features/angular-reference-selection-foundation/angular-reference-selection-foundation-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-reference-selection-foundation-master | 3 | `89001f0f82ef697025a5065360e679728b8a9a66d431f15041a7c4a82b663fea` |
| angular-reference-selection-foundation-master | 4 | `298f39e8f9b7fd7822edce0f1349b6c89c18b2c702901c2255a8e0a25282b9f2` |
| angular-reference-selection-foundation-master | 6 | `f23c5727ad7a87ce9eed57a1ed99d3d6c842ba51ae556b0be17649845c404a16` |
| angular-reference-selection-foundation-master | 7 | `f302fc3abbe2c2596bc26d7c93965dd5d36a9f9c85e13b2fd843ae9674b49465` |
| angular-reference-selection-foundation-master | 8 | `6a2b5a31d342ee7f4b5d95bf35cb98c65de7e9bc88c0218f080411461abbbeba` |
| angular-reference-selection-foundation-api | 6 | `f23c5727ad7a87ce9eed57a1ed99d3d6c842ba51ae556b0be17649845c404a16` |
| angular-reference-selection-foundation-api | 7 | `f302fc3abbe2c2596bc26d7c93965dd5d36a9f9c85e13b2fd843ae9674b49465` |
| angular-reference-selection-foundation-api | 8 | `6a2b5a31d342ee7f4b5d95bf35cb98c65de7e9bc88c0218f080411461abbbeba` |
| angular-reference-selection-foundation-web | 6 | `f23c5727ad7a87ce9eed57a1ed99d3d6c842ba51ae556b0be17649845c404a16` |
| angular-reference-selection-foundation-web | 7 | `f302fc3abbe2c2596bc26d7c93965dd5d36a9f9c85e13b2fd843ae9674b49465` |
| angular-reference-selection-foundation-web | 8 | `6a2b5a31d342ee7f4b5d95bf35cb98c65de7e9bc88c0218f080411461abbbeba` |
| angular-reference-selection-foundation-web | 9 | `e0cae5b9f75bda3965fbb2f4a7484fc6fe1da3799a7f9cd5b990b855b5c7216b` |
| angular-reference-selection-foundation-mobile | 9 | `e0cae5b9f75bda3965fbb2f4a7484fc6fe1da3799a7f9cd5b990b855b5c7216b` |
| angular-reference-selection-foundation-mobile | 10 | `3dc1fc0618d3a5213ece8855cc506bb6a802c6f5b514953ce804fdc8e569ab93` |
| angular-reference-selection-foundation-mobile | 11 | `ab8a7910fbd3887fd970ce73c314a0edb77a9bc31ea92718e1c0a7e52125331c` |
