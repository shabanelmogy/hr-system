<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Angular Application Shell Phase 04 - Domain Actions and Lifecycle

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

- **Angular Application Shell cross-platform master review:** `../modules/platform/features/angular-application-shell/angular-application-shell-review.md` sections 3, 4, 6, 7, 8
- **Angular Application Shell API implementation profile:** `../modules/platform/features/angular-application-shell/angular-application-shell-api.md` sections 6, 7, 8
- **Angular Application Shell Angular web implementation profile:** `../modules/platform/features/angular-application-shell/angular-application-shell-web.md` sections 6, 7, 8, 9
- **Angular Application Shell Expo implementation profile:** `../modules/platform/features/angular-application-shell/angular-application-shell-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-application-shell-master | 3 | `f2aacdc73cc17945bc17eb5c69923fbdf857d48106aba97f6953101712ccc647` |
| angular-application-shell-master | 4 | `caf058a22c30460e1e9b20a688f77f8ced402b30e75d5e7619a99c59618b66b4` |
| angular-application-shell-master | 6 | `faabbbe88bf326eea9511bbf97bec39a1b42c35ce2230c655e71672291c3231c` |
| angular-application-shell-master | 7 | `38103c6fc5fc366e8d4808935148f4982bc2ff7a1077bc6b47866a5a59341914` |
| angular-application-shell-master | 8 | `ca4ee16c814aceee76194125377f3bd6b8f2007d2ba647b8d7ddbdae5617834e` |
| angular-application-shell-api | 6 | `faabbbe88bf326eea9511bbf97bec39a1b42c35ce2230c655e71672291c3231c` |
| angular-application-shell-api | 7 | `38103c6fc5fc366e8d4808935148f4982bc2ff7a1077bc6b47866a5a59341914` |
| angular-application-shell-api | 8 | `ca4ee16c814aceee76194125377f3bd6b8f2007d2ba647b8d7ddbdae5617834e` |
| angular-application-shell-web | 6 | `faabbbe88bf326eea9511bbf97bec39a1b42c35ce2230c655e71672291c3231c` |
| angular-application-shell-web | 7 | `38103c6fc5fc366e8d4808935148f4982bc2ff7a1077bc6b47866a5a59341914` |
| angular-application-shell-web | 8 | `ca4ee16c814aceee76194125377f3bd6b8f2007d2ba647b8d7ddbdae5617834e` |
| angular-application-shell-web | 9 | `171a213120b293cd32c3bb0e2ec90a86d4baff38de60c8ec38a72053fa61aced` |
| angular-application-shell-mobile | 9 | `171a213120b293cd32c3bb0e2ec90a86d4baff38de60c8ec38a72053fa61aced` |
| angular-application-shell-mobile | 10 | `99e22673f4a63eb2aa922a85364d71c0c32f7b06bf02467ab629acd0288e8de1` |
| angular-application-shell-mobile | 11 | `4afad814fac09a3ae3647a6a443a6ee3d0a50162a0a2ca29ddaff98d0e28120f` |
