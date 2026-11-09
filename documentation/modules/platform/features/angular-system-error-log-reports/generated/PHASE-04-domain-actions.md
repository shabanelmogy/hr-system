<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# System Error Logs managed reports Phase 04 - Domain Actions and Lifecycle

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

- **System Error Logs managed reports cross-platform master review:** `../modules/platform/features/angular-system-error-log-reports/angular-system-error-log-reports-review.md` sections 3, 4, 6, 7, 8
- **System Error Logs managed reports API implementation profile:** `../modules/platform/features/angular-system-error-log-reports/angular-system-error-log-reports-api.md` sections 6, 7, 8
- **System Error Logs managed reports Next.js implementation profile:** `../modules/platform/features/angular-system-error-log-reports/angular-system-error-log-reports-web.md` sections 6, 7, 8, 9
- **System Error Logs managed reports Expo implementation profile:** `../modules/platform/features/angular-system-error-log-reports/angular-system-error-log-reports-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-error-log-reports-master | 3 | `af5eaaef486626fff1d4354733e65c1a9458f5ef9609f6286761ecb451b0998c` |
| angular-system-error-log-reports-master | 4 | `dae0a8847e44166632877639f7e93fc1a1262ee7002bda5355bcd1760d2c3a68` |
| angular-system-error-log-reports-master | 6 | `df0dc6ec5bd68ab7fc21c09cee491973d00caacc2610c7aac7123a97cb31fd70` |
| angular-system-error-log-reports-master | 7 | `6b5a31169e46bb252b0ed56eb85abd716a87d874baa33973d080d38a2c31fa71` |
| angular-system-error-log-reports-master | 8 | `1ec0e54b3e2444a14359521d9da0f0c59a3c0f17284a40bd3c54369d44a4ae59` |
| angular-system-error-log-reports-api | 6 | `df0dc6ec5bd68ab7fc21c09cee491973d00caacc2610c7aac7123a97cb31fd70` |
| angular-system-error-log-reports-api | 7 | `6b5a31169e46bb252b0ed56eb85abd716a87d874baa33973d080d38a2c31fa71` |
| angular-system-error-log-reports-api | 8 | `1ec0e54b3e2444a14359521d9da0f0c59a3c0f17284a40bd3c54369d44a4ae59` |
| angular-system-error-log-reports-web | 6 | `df0dc6ec5bd68ab7fc21c09cee491973d00caacc2610c7aac7123a97cb31fd70` |
| angular-system-error-log-reports-web | 7 | `64ad1bf68af7a861e3e2f785b587e07b374705fbc8207850448c031200d71a93` |
| angular-system-error-log-reports-web | 8 | `1ec0e54b3e2444a14359521d9da0f0c59a3c0f17284a40bd3c54369d44a4ae59` |
| angular-system-error-log-reports-web | 9 | `1ddff9f3055780218661a25e809c013f8ae479eced425af4ce7f9c803c473ee9` |
| angular-system-error-log-reports-mobile | 9 | `1ddff9f3055780218661a25e809c013f8ae479eced425af4ce7f9c803c473ee9` |
| angular-system-error-log-reports-mobile | 10 | `bdfecdeaebe5da652531314b0993ce8305ec61732bb2a9c3bc48a95a44ad8702` |
| angular-system-error-log-reports-mobile | 11 | `aae000f51a6f9b0334a5a5aa321b6e2c6b76c49ea421e9a824f371f1dfee332b` |
