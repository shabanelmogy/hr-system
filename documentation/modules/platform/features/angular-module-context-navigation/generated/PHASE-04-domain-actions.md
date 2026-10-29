<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Angular application context navigation Phase 04 - Domain Actions and Lifecycle

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

- **Angular application context navigation cross-platform master review:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-review.md` sections 3, 4, 6, 7, 8
- **Angular application context navigation API implementation profile:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-api.md` sections 6, 7, 8
- **Angular application context navigation Next.js implementation profile:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-web.md` sections 6, 7, 8, 9
- **Angular application context navigation Expo implementation profile:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-module-context-navigation-master | 3 | `b360497f8f7a980a9b2e158a0a14f5452ed6bdbf7c98891fa791064460ae6390` |
| angular-module-context-navigation-master | 4 | `c1324c1cfb273d7ea9912b07e2c2e2eb5826afac16b1e3439e4c10d30ed5a0a0` |
| angular-module-context-navigation-master | 6 | `8ec030f4e1c72aa5c699512260c1c57d68ebd7688d2b02e3013500dd8f961336` |
| angular-module-context-navigation-master | 7 | `121cd35d3780b240c74f440e3f368fc2c3e388ea0b602cfe9595e04f66aa23ea` |
| angular-module-context-navigation-master | 8 | `8fe455f912589c8225049720348791a1b3f36a0bbb64fd18640fe27e425f1726` |
| angular-module-context-navigation-api | 6 | `8ec030f4e1c72aa5c699512260c1c57d68ebd7688d2b02e3013500dd8f961336` |
| angular-module-context-navigation-api | 7 | `121cd35d3780b240c74f440e3f368fc2c3e388ea0b602cfe9595e04f66aa23ea` |
| angular-module-context-navigation-api | 8 | `8fe455f912589c8225049720348791a1b3f36a0bbb64fd18640fe27e425f1726` |
| angular-module-context-navigation-web | 6 | `8ec030f4e1c72aa5c699512260c1c57d68ebd7688d2b02e3013500dd8f961336` |
| angular-module-context-navigation-web | 7 | `121cd35d3780b240c74f440e3f368fc2c3e388ea0b602cfe9595e04f66aa23ea` |
| angular-module-context-navigation-web | 8 | `8fe455f912589c8225049720348791a1b3f36a0bbb64fd18640fe27e425f1726` |
| angular-module-context-navigation-web | 9 | `5c8b535c12fcf226da0d043061e2fe30da081036abe32c27e1862428f2f872a9` |
| angular-module-context-navigation-mobile | 9 | `5c8b535c12fcf226da0d043061e2fe30da081036abe32c27e1862428f2f872a9` |
| angular-module-context-navigation-mobile | 10 | `dddfcf4db65993beab3a319f9abebb699878f3620d64ea3cab5d74456652b3e5` |
| angular-module-context-navigation-mobile | 11 | `1fbb9765392d357a650913625dc67d4591b4d163b68b5ee40e753d1d5e1b6168` |
