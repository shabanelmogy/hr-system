<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Countries managed report integration Phase 04 - Domain Actions and Lifecycle

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

- **Countries managed report integration cross-platform master review:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-review.md` sections 3, 4, 6, 7, 8
- **Countries managed report integration API implementation profile:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-api.md` sections 6, 7, 8
- **Countries managed report integration Next.js implementation profile:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-web.md` sections 6, 7, 8, 9
- **Countries managed report integration Expo implementation profile:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-report-view-master | 3 | `dac0aafd01072bcd072b7fb9173bd520856278ceda3129d7325f20ec8a47b325` |
| angular-countries-report-view-master | 4 | `3b38fdb0f0c035d49d625c0ef5925ea5dab689790a0e902b6d14455d457ffc2e` |
| angular-countries-report-view-master | 6 | `97a7a27cdc275344b63b9f89e0a89f42c54f4857f207cb9029e9302d425ae8fc` |
| angular-countries-report-view-master | 7 | `bdc28a44e43d6e2dcd0c2e5e7701abcf746b167b32fc8e7a63d34a0c9d7c1ef8` |
| angular-countries-report-view-master | 8 | `7b60972b45ea2acdcdca1d0674b119b26fa40d043d89416c6df3796537de9fc8` |
| angular-countries-report-view-api | 6 | `97a7a27cdc275344b63b9f89e0a89f42c54f4857f207cb9029e9302d425ae8fc` |
| angular-countries-report-view-api | 7 | `bdc28a44e43d6e2dcd0c2e5e7701abcf746b167b32fc8e7a63d34a0c9d7c1ef8` |
| angular-countries-report-view-api | 8 | `7b60972b45ea2acdcdca1d0674b119b26fa40d043d89416c6df3796537de9fc8` |
| angular-countries-report-view-web | 6 | `97a7a27cdc275344b63b9f89e0a89f42c54f4857f207cb9029e9302d425ae8fc` |
| angular-countries-report-view-web | 7 | `bdc28a44e43d6e2dcd0c2e5e7701abcf746b167b32fc8e7a63d34a0c9d7c1ef8` |
| angular-countries-report-view-web | 8 | `7b60972b45ea2acdcdca1d0674b119b26fa40d043d89416c6df3796537de9fc8` |
| angular-countries-report-view-web | 9 | `0215aed4368565042ad4967e981f04b00180df8b9b530c8e779be74fb01b3b98` |
| angular-countries-report-view-mobile | 9 | `0215aed4368565042ad4967e981f04b00180df8b9b530c8e779be74fb01b3b98` |
| angular-countries-report-view-mobile | 10 | `13d60bdce102af4d3de471b1c12d188b22f6defca177537ecb29b0a236150bca` |
| angular-countries-report-view-mobile | 11 | `07d4a23ab10ebc939015f30437df95f269e1947926ae9878cceb0fd53cf1d7f2` |
