<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Countries pilot preparation Phase 04 - Domain Actions and Lifecycle

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

- **Countries pilot preparation cross-platform master review:** `../modules/platform/features/angular-countries-pilot-preparation/angular-countries-pilot-preparation-review.md` sections 3, 4, 6, 7, 8
- **Countries pilot preparation API implementation profile:** `../modules/platform/features/angular-countries-pilot-preparation/angular-countries-pilot-preparation-api.md` sections 6, 7, 8
- **Countries pilot preparation Next.js implementation profile:** `../modules/platform/features/angular-countries-pilot-preparation/angular-countries-pilot-preparation-web.md` sections 6, 7, 8, 9
- **Countries pilot preparation Expo implementation profile:** `../modules/platform/features/angular-countries-pilot-preparation/angular-countries-pilot-preparation-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-pilot-preparation-master | 3 | `501ef0b9eef132639e93fb02b0f8576e649d544ebbbf5196b1247ef045af7682` |
| angular-countries-pilot-preparation-master | 4 | `1c73770cd45e7c8c070200ef9519ac7fd1c97478c2fcba4f3cf85560391068c1` |
| angular-countries-pilot-preparation-master | 6 | `63f6cadc90c5b7a65d7ada2d9804750ba56b1b0b45d29aade44d6131b4c38a06` |
| angular-countries-pilot-preparation-master | 7 | `47a9d24047af73aaf314c020f9296502e9d68a99fba5c5869fa3afcd4a60674d` |
| angular-countries-pilot-preparation-master | 8 | `6de19e9783c84f5dae33a0930b620ad41f23271249357863cc6b5674b112db4e` |
| angular-countries-pilot-preparation-api | 6 | `63f6cadc90c5b7a65d7ada2d9804750ba56b1b0b45d29aade44d6131b4c38a06` |
| angular-countries-pilot-preparation-api | 7 | `47a9d24047af73aaf314c020f9296502e9d68a99fba5c5869fa3afcd4a60674d` |
| angular-countries-pilot-preparation-api | 8 | `6de19e9783c84f5dae33a0930b620ad41f23271249357863cc6b5674b112db4e` |
| angular-countries-pilot-preparation-web | 6 | `63f6cadc90c5b7a65d7ada2d9804750ba56b1b0b45d29aade44d6131b4c38a06` |
| angular-countries-pilot-preparation-web | 7 | `47a9d24047af73aaf314c020f9296502e9d68a99fba5c5869fa3afcd4a60674d` |
| angular-countries-pilot-preparation-web | 8 | `6de19e9783c84f5dae33a0930b620ad41f23271249357863cc6b5674b112db4e` |
| angular-countries-pilot-preparation-web | 9 | `cf8e09d2816484ef5fe1b3d550ed61098cb7739b6e69934182c068724c7fab6b` |
| angular-countries-pilot-preparation-mobile | 9 | `cf8e09d2816484ef5fe1b3d550ed61098cb7739b6e69934182c068724c7fab6b` |
| angular-countries-pilot-preparation-mobile | 10 | `99ebce40b5bf08863732dc80464d3f3199aa700b4358f38675af7ba7e1caf6f3` |
| angular-countries-pilot-preparation-mobile | 11 | `d76489077b244af829c6b552caf7e3b93e3292389e9991d164156b42530b0983` |
