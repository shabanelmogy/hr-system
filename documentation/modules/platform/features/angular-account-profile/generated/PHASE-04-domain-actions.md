<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Angular own account profile and password parity Phase 04 - Domain Actions and Lifecycle

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

- **Angular own account profile and password parity cross-platform master review:** `../modules/platform/features/angular-account-profile/angular-account-profile-review.md` sections 3, 4, 6, 7, 8
- **Angular own account profile and password parity API implementation profile:** `../modules/platform/features/angular-account-profile/angular-account-profile-api.md` sections 6, 7, 8
- **Angular own account profile and password parity Next.js implementation profile:** `../modules/platform/features/angular-account-profile/angular-account-profile-web.md` sections 6, 7, 8, 9
- **Angular own account profile and password parity Expo implementation profile:** `../modules/platform/features/angular-account-profile/angular-account-profile-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-account-profile-master | 3 | `05547cc9418b3c0fb9169c218ceafd746a6f4e0ffd41909784fddbf12c28f4d4` |
| angular-account-profile-master | 4 | `56b31df492f4c4b102eeb2517deb5b9210e0630d9e03d8fa9c9562df7349a264` |
| angular-account-profile-master | 6 | `a240983bf992c17a33cb7680bacfe0ef92dd3e2694296b1f3199cba091beca34` |
| angular-account-profile-master | 7 | `aa5ef891fd2f24c184c7aa7bf6720fd20da131dda59ae74add398dd07ea2b5bb` |
| angular-account-profile-master | 8 | `217c42df40f14da6354dd45e279666c1c3af648d1665b0113ce955218239da2c` |
| angular-account-profile-api | 6 | `de2a02c83421dcbf788b87e6fbbe010b76eb0c5cd94b7f5d8a3f1ff62b8afe69` |
| angular-account-profile-api | 7 | `abd2e1abc8683325404db6045b06643b24f4a0607163eb22984070f46ed0dfb1` |
| angular-account-profile-api | 8 | `1e50eb56692bd565bb3353f0168de1eabbf9e0a92593a86357eb09f345ca62e0` |
| angular-account-profile-web | 6 | `ccc945826e3a0c2c32800e661c3b82cc3c78099d577bb302ab50d3fabf349887` |
| angular-account-profile-web | 7 | `ac13908856413ade9b2dac5ef7a140cb86bea515513a9bc65c7ee7d1c53005ff` |
| angular-account-profile-web | 8 | `675ade0e2beebd6fb4de655089ba26147186e8f045b7db42901788f4934f3c36` |
| angular-account-profile-web | 9 | `f9191313c14930ef254e55e3f5937ffeb41ce2f44811d2b65cfdbd095285c76f` |
| angular-account-profile-mobile | 9 | `fdbf9b2120b5ff8155b15fbb7a33eae3494f22515517494ca6810d849b691c51` |
| angular-account-profile-mobile | 10 | `cdb49073e986a0fa1085c4c1714d5afc13fa76ff09e8cad1e68338c21bebbc9e` |
| angular-account-profile-mobile | 11 | `3a3987c56d55e9a5e1281f0241ff2eaad283e4692d917fe71dc5cc8b471231d0` |
