<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Error Logs Phase 04 - Domain Actions and Lifecycle

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

- **Error Logs cross-platform master review:** `../modules/platform/features/error-logs/error-logs-review.md` sections 3, 4, 6, 7, 8
- **Error Logs API implementation profile:** `../modules/platform/features/error-logs/error-logs-api.md` sections 6, 7, 8
- **Error Logs Next.js implementation profile:** `../modules/platform/features/error-logs/error-logs-web.md` sections 6, 7, 8, 9
- **Error Logs Expo implementation profile:** `../modules/platform/features/error-logs/error-logs-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| error-logs-master | 3 | `fb41d4ee24c001854a6ee49c9c1e0a9d96d5f06876b01645b87516e286d08782` |
| error-logs-master | 4 | `b2c5336b615e80ae9ddb993d4506bda33f4d1ddd4d132280a8baf4e1cda3163a` |
| error-logs-master | 6 | `fd16df7662f5aee4c4df61b0f350e005f1c2cbdde6933cc61c30fe6287931107` |
| error-logs-master | 7 | `8ab6dbea01784875b50c966894f345e7f266562d5bf01ddb80ce3fc784f2a08f` |
| error-logs-master | 8 | `6198b523cd843d366cf4b6582c4b83da22776b83808018b1b5ee1d89d444fdc1` |
| error-logs-api | 6 | `4ef31b79d8208d9d72b9f00d74c160a2d3eb7c8732430e7538c5d15ab830d4d1` |
| error-logs-api | 7 | `2687eee83f53ac8560e0fc08b822c7ee66fb08e1ff631fa6a499ceb91b1123ff` |
| error-logs-api | 8 | `796b04653e5f28dd3f58cbb913eaded3782fee609b2ebc3447d104216260a8e7` |
| error-logs-web | 6 | `c18ae4a9c8783cbc7a445f63f39c7990ae15006a3baad2e03181b4738b6f77ef` |
| error-logs-web | 7 | `c32752ed4aaed4305da1eaac93b8f1cd880da3600d543f707dfbcba80dd4d614` |
| error-logs-web | 8 | `b9db19550a59947a1a4f0e1c2afc14d157fd739f26d499ef98a7a5ad2f2c7bfd` |
| error-logs-web | 9 | `e54ce688f8dfb5e6bb6b56398f5ca6702fc2747a3ccf8cd233dd93c22390168f` |
| error-logs-mobile | 9 | `47d430e6370bf7789d7b0ff08302c515713933be74c457587d21b04636927408` |
| error-logs-mobile | 10 | `2e7d318c11c945981cbe57f74b79268345c36462938cbc5978e5cf8bc496dd8c` |
| error-logs-mobile | 11 | `c9fd373ffb35d90394b35bbf94ded27f3e475bd9ab534ad6c1d81c6ee0356953` |
