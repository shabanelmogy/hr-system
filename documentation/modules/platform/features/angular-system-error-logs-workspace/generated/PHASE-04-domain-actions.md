<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Super Admin System Error Logs and Settings parity Phase 04 - Domain Actions and Lifecycle

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

- **Super Admin System Error Logs and Settings parity cross-platform master review:** `../modules/platform/features/angular-system-error-logs-workspace/angular-system-error-logs-workspace-review.md` sections 3, 4, 6, 7, 8
- **Super Admin System Error Logs and Settings parity API implementation profile:** `../modules/platform/features/angular-system-error-logs-workspace/angular-system-error-logs-workspace-api.md` sections 6, 7, 8
- **Super Admin System Error Logs and Settings parity Angular implementation profile:** `../modules/platform/features/angular-system-error-logs-workspace/angular-system-error-logs-workspace-web.md` sections 6, 7, 8, 9
- **Super Admin System Error Logs and Settings parity Expo implementation profile:** `../modules/platform/features/angular-system-error-logs-workspace/angular-system-error-logs-workspace-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-error-logs-workspace-master | 3 | `74b5b6bc297245ac52302d58ff8c4130a89c8d3879aa68d314a08fb9b18928d7` |
| angular-system-error-logs-workspace-master | 4 | `ea13c26fe451e25e2389849c6baa46db19db0e2e5818b47fcacd55b3a2281a0c` |
| angular-system-error-logs-workspace-master | 6 | `2e7929211572a0f3804eb9513fa7c0e74a249c19c2f95a606e097aec1e2521ff` |
| angular-system-error-logs-workspace-master | 7 | `84181d820cbe9950ec74ef69e865f89812e40ffd68eaca7532d3106cb9daf506` |
| angular-system-error-logs-workspace-master | 8 | `6f43bfd7053bfa065d6f1e2bceb15dc4556e7a92bd21fced18040a30cc8a7845` |
| angular-system-error-logs-workspace-api | 6 | `2e7929211572a0f3804eb9513fa7c0e74a249c19c2f95a606e097aec1e2521ff` |
| angular-system-error-logs-workspace-api | 7 | `84181d820cbe9950ec74ef69e865f89812e40ffd68eaca7532d3106cb9daf506` |
| angular-system-error-logs-workspace-api | 8 | `6f43bfd7053bfa065d6f1e2bceb15dc4556e7a92bd21fced18040a30cc8a7845` |
| angular-system-error-logs-workspace-web | 6 | `2e7929211572a0f3804eb9513fa7c0e74a249c19c2f95a606e097aec1e2521ff` |
| angular-system-error-logs-workspace-web | 7 | `84181d820cbe9950ec74ef69e865f89812e40ffd68eaca7532d3106cb9daf506` |
| angular-system-error-logs-workspace-web | 8 | `6f43bfd7053bfa065d6f1e2bceb15dc4556e7a92bd21fced18040a30cc8a7845` |
| angular-system-error-logs-workspace-web | 9 | `e98c2390ea74ebb9e125f9ab193cb9ee91f6be26ff2a951666083039aae33ba0` |
| angular-system-error-logs-workspace-mobile | 9 | `e98c2390ea74ebb9e125f9ab193cb9ee91f6be26ff2a951666083039aae33ba0` |
| angular-system-error-logs-workspace-mobile | 10 | `fee1dff779bd0040e0ea1567ddd715c9152f9f2552db2323caf2732ad03c6d0c` |
| angular-system-error-logs-workspace-mobile | 11 | `24d7b0fd035ab332a688f41685fc07897e3643351b53a90c627dfd8403d37d72` |
