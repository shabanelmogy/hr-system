<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Shared date-only field preparation Phase 04 - Domain Actions and Lifecycle

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

- **Shared date-only field preparation cross-platform master review:** `../modules/platform/features/angular-date-field-foundation/angular-date-field-foundation-review.md` sections 3, 4, 6, 7, 8
- **Shared date-only field preparation API implementation profile:** `../modules/platform/features/angular-date-field-foundation/angular-date-field-foundation-api.md` sections 6, 7, 8
- **Shared date-only field preparation Next.js implementation profile:** `../modules/platform/features/angular-date-field-foundation/angular-date-field-foundation-web.md` sections 6, 7, 8, 9
- **Shared date-only field preparation Expo implementation profile:** `../modules/platform/features/angular-date-field-foundation/angular-date-field-foundation-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-date-field-foundation-master | 3 | `23e20132deb3637d09a0d142107706cf24c8632497d450987b365993df49b620` |
| angular-date-field-foundation-master | 4 | `56869c4802b77dda2f3a6eeef12e8209e60500e47881aa4fe0ad96c412c55dfe` |
| angular-date-field-foundation-master | 6 | `5c78dd050fbcee69f99914bc203a48759ad20907e1032ec5d90644490a960545` |
| angular-date-field-foundation-master | 7 | `9e324801adf4cf50a669bbae92c944015e530449d22cf0cf35026ba210f27ca7` |
| angular-date-field-foundation-master | 8 | `5b2660e078c4586cc2203a485dea38bfb6d6d3a8456596f5f8d4e7f17a6a3143` |
| angular-date-field-foundation-api | 6 | `5c78dd050fbcee69f99914bc203a48759ad20907e1032ec5d90644490a960545` |
| angular-date-field-foundation-api | 7 | `9e324801adf4cf50a669bbae92c944015e530449d22cf0cf35026ba210f27ca7` |
| angular-date-field-foundation-api | 8 | `5b2660e078c4586cc2203a485dea38bfb6d6d3a8456596f5f8d4e7f17a6a3143` |
| angular-date-field-foundation-web | 6 | `5c78dd050fbcee69f99914bc203a48759ad20907e1032ec5d90644490a960545` |
| angular-date-field-foundation-web | 7 | `9e324801adf4cf50a669bbae92c944015e530449d22cf0cf35026ba210f27ca7` |
| angular-date-field-foundation-web | 8 | `5b2660e078c4586cc2203a485dea38bfb6d6d3a8456596f5f8d4e7f17a6a3143` |
| angular-date-field-foundation-web | 9 | `46307ad33ca60cd0d2aa6779fcef25809b5bddbbe6ed0910a56c0fdb22e6b0a2` |
| angular-date-field-foundation-mobile | 9 | `46307ad33ca60cd0d2aa6779fcef25809b5bddbbe6ed0910a56c0fdb22e6b0a2` |
| angular-date-field-foundation-mobile | 10 | `33fde289be4b6f5d29ee9fe5f5cd9501b57d5b726426a2b13fe47e40fa5a2b8b` |
| angular-date-field-foundation-mobile | 11 | `81fdb53d5c5d5e91e6457833d212cff7677988658c8317d72325e3201ab4a18e` |
