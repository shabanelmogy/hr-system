<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Foundation exit and pilot readiness assessment Phase 04 - Domain Actions and Lifecycle

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

- **Foundation exit and pilot readiness assessment cross-platform master review:** `../modules/platform/features/angular-foundation-exit-assessment/angular-foundation-exit-assessment-review.md` sections 3, 4, 6, 7, 8
- **Foundation exit and pilot readiness assessment API implementation profile:** `../modules/platform/features/angular-foundation-exit-assessment/angular-foundation-exit-assessment-api.md` sections 6, 7, 8
- **Foundation exit and pilot readiness assessment Next.js implementation profile:** `../modules/platform/features/angular-foundation-exit-assessment/angular-foundation-exit-assessment-web.md` sections 6, 7, 8, 9
- **Foundation exit and pilot readiness assessment Expo implementation profile:** `../modules/platform/features/angular-foundation-exit-assessment/angular-foundation-exit-assessment-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-foundation-exit-assessment-master | 3 | `4d3e255c72cac77b7f7bffb8b155ce832838a6c542bdc0b422902dda2c32dda4` |
| angular-foundation-exit-assessment-master | 4 | `ef1886603d2b739301c6583a472a3a32660fb656e28205f44378bd185952df7a` |
| angular-foundation-exit-assessment-master | 6 | `fbfe8ff363cfd32471333529d87cb118044ec7b76590705a0f08139b4b04006a` |
| angular-foundation-exit-assessment-master | 7 | `574b028cc3d8b969e4c433ba7f95e864d61fa8441914bc22adb2a275213a7fc0` |
| angular-foundation-exit-assessment-master | 8 | `a68ecda2bfe01f209cbb52e0793eaeb7d6966de6a5c17412d244ec9fdfc9f3ce` |
| angular-foundation-exit-assessment-api | 6 | `fbfe8ff363cfd32471333529d87cb118044ec7b76590705a0f08139b4b04006a` |
| angular-foundation-exit-assessment-api | 7 | `574b028cc3d8b969e4c433ba7f95e864d61fa8441914bc22adb2a275213a7fc0` |
| angular-foundation-exit-assessment-api | 8 | `a68ecda2bfe01f209cbb52e0793eaeb7d6966de6a5c17412d244ec9fdfc9f3ce` |
| angular-foundation-exit-assessment-web | 6 | `fbfe8ff363cfd32471333529d87cb118044ec7b76590705a0f08139b4b04006a` |
| angular-foundation-exit-assessment-web | 7 | `574b028cc3d8b969e4c433ba7f95e864d61fa8441914bc22adb2a275213a7fc0` |
| angular-foundation-exit-assessment-web | 8 | `a68ecda2bfe01f209cbb52e0793eaeb7d6966de6a5c17412d244ec9fdfc9f3ce` |
| angular-foundation-exit-assessment-web | 9 | `5617cac65bbfa4d8cf8a167359903eb51c4ab7ef68f1fcfc00cb268848e0c8a4` |
| angular-foundation-exit-assessment-mobile | 9 | `5617cac65bbfa4d8cf8a167359903eb51c4ab7ef68f1fcfc00cb268848e0c8a4` |
| angular-foundation-exit-assessment-mobile | 10 | `dfd965d7afe5fffcff2d3df939f8447b6070c5a7bf56d76963ec3b264ede0f5f` |
| angular-foundation-exit-assessment-mobile | 11 | `a41f7ddf6804f9ac73e341369b1de373fd3da999c0fc5948788176cc586e1e87` |
