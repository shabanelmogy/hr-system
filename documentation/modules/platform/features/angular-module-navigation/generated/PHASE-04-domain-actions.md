<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Angular Module Navigation Phase 04 - Domain Actions and Lifecycle

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

- **Angular Module Navigation cross-platform master review:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-review.md` sections 3, 4, 6, 7, 8
- **Angular Module Navigation API implementation profile:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-api.md` sections 6, 7, 8
- **Angular Module Navigation Angular web implementation profile:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-web.md` sections 6, 7, 8, 9
- **Angular Module Navigation Expo implementation profile:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-module-navigation-master | 3 | `76f26338eb1258b3e8840ffedc2c3f3899dcf263520a65d88924c4a63a1b54dd` |
| angular-module-navigation-master | 4 | `b28a3b2785647f5b9b22349ffe73a0dc47e51a6109e6c55c040af287c7059528` |
| angular-module-navigation-master | 6 | `c7773a3a3d0320d23e28d420cb03a504db926c0a495f24ef84a2926c8d88a00a` |
| angular-module-navigation-master | 7 | `c0368a40fcdb1d0dc4a2648e49ff4afedf43fd35705dcd3e186709a51d923980` |
| angular-module-navigation-master | 8 | `a28c8e7ab96b8e263b65d6cc6f29ddcd7aa21eb204515da26481e4240515a6d9` |
| angular-module-navigation-api | 6 | `c7773a3a3d0320d23e28d420cb03a504db926c0a495f24ef84a2926c8d88a00a` |
| angular-module-navigation-api | 7 | `c0368a40fcdb1d0dc4a2648e49ff4afedf43fd35705dcd3e186709a51d923980` |
| angular-module-navigation-api | 8 | `a28c8e7ab96b8e263b65d6cc6f29ddcd7aa21eb204515da26481e4240515a6d9` |
| angular-module-navigation-web | 6 | `c7773a3a3d0320d23e28d420cb03a504db926c0a495f24ef84a2926c8d88a00a` |
| angular-module-navigation-web | 7 | `c0368a40fcdb1d0dc4a2648e49ff4afedf43fd35705dcd3e186709a51d923980` |
| angular-module-navigation-web | 8 | `a28c8e7ab96b8e263b65d6cc6f29ddcd7aa21eb204515da26481e4240515a6d9` |
| angular-module-navigation-web | 9 | `9950bddc28087fecd3db8304d05b405fea1c86b9944f70ed2deaf4ae597fb96d` |
| angular-module-navigation-mobile | 9 | `9950bddc28087fecd3db8304d05b405fea1c86b9944f70ed2deaf4ae597fb96d` |
| angular-module-navigation-mobile | 10 | `efe41e6f92e1f3ac374e8884cdcc69bb7a57e9e92f2a575c56b009ba123ca16f` |
| angular-module-navigation-mobile | 11 | `b4c289942920da35fc175c9081cb5d577f732a62a5ed72c8877847cdbaef54f8` |
