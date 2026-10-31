<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Countries archive and restore Phase 04 - Domain Actions and Lifecycle

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

- **Countries archive and restore cross-platform master review:** `../modules/platform/features/angular-countries-lifecycle/angular-countries-lifecycle-review.md` sections 3, 4, 6, 7, 8
- **Countries archive and restore API implementation profile:** `../modules/platform/features/angular-countries-lifecycle/angular-countries-lifecycle-api.md` sections 6, 7, 8
- **Countries archive and restore Next.js implementation profile:** `../modules/platform/features/angular-countries-lifecycle/angular-countries-lifecycle-web.md` sections 6, 7, 8, 9
- **Countries archive and restore Expo implementation profile:** `../modules/platform/features/angular-countries-lifecycle/angular-countries-lifecycle-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-lifecycle-master | 3 | `2a99dc9056c58c3f8022a4321a6148bbdd7ba7a19f0dead110a8d7450cfded45` |
| angular-countries-lifecycle-master | 4 | `331e6637776a260b38003b52ffe9e21cabcf7f48d2e8ee51e8539660e2b2cb29` |
| angular-countries-lifecycle-master | 6 | `84b65d022d32811ad94d9c9aad2d0196243d75800b2f2de084df6be35b0ed3ae` |
| angular-countries-lifecycle-master | 7 | `f0727bca0b6c32ce6a15526681ae23f73eda6f0933f598b79a7d923d26a7d19b` |
| angular-countries-lifecycle-master | 8 | `666370365740a43f1c958be3f6068e9349259450ddceb922cbd87521a825c607` |
| angular-countries-lifecycle-api | 6 | `84b65d022d32811ad94d9c9aad2d0196243d75800b2f2de084df6be35b0ed3ae` |
| angular-countries-lifecycle-api | 7 | `f0727bca0b6c32ce6a15526681ae23f73eda6f0933f598b79a7d923d26a7d19b` |
| angular-countries-lifecycle-api | 8 | `666370365740a43f1c958be3f6068e9349259450ddceb922cbd87521a825c607` |
| angular-countries-lifecycle-web | 6 | `84b65d022d32811ad94d9c9aad2d0196243d75800b2f2de084df6be35b0ed3ae` |
| angular-countries-lifecycle-web | 7 | `f0727bca0b6c32ce6a15526681ae23f73eda6f0933f598b79a7d923d26a7d19b` |
| angular-countries-lifecycle-web | 8 | `666370365740a43f1c958be3f6068e9349259450ddceb922cbd87521a825c607` |
| angular-countries-lifecycle-web | 9 | `6c08316e9011bf4af0c9b35261ef93ed45b66954d59e93cb192ca8c5eb69b5ad` |
| angular-countries-lifecycle-mobile | 9 | `6c08316e9011bf4af0c9b35261ef93ed45b66954d59e93cb192ca8c5eb69b5ad` |
| angular-countries-lifecycle-mobile | 10 | `030e42cb4a42c82430ec2e0580076939f542a4db8345e80c239a8642c4c931e4` |
| angular-countries-lifecycle-mobile | 11 | `a3598268a0d4ef491b466389ab4f513512d9f78be03e1f5ca8a9fb22f1e29cc5` |
