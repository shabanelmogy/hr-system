<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Company Message Logs Phase 04 - Domain Actions and Lifecycle

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

- **Company Message Logs cross-platform master review:** `../modules/platform/features/message-logs/message-logs-review.md` sections 3, 4, 6, 7, 8
- **Company Message Logs API implementation profile:** `../modules/platform/features/message-logs/message-logs-api.md` sections 6, 7, 8
- **Company Message Logs Next.js implementation profile:** `../modules/platform/features/message-logs/message-logs-web.md` sections 6, 7, 8, 9
- **Company Message Logs Expo implementation profile:** `../modules/platform/features/message-logs/message-logs-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| message-logs-master | 3 | `4638d6f083a74a571f8a8252d81081c43d17d8f48eb26ee139c23e5471b85245` |
| message-logs-master | 4 | `963dd2c8e0e45d558cbecf309b2f8d2a206af2b1104a6352b9f595d8a33c64be` |
| message-logs-master | 6 | `aa21844a4a1e0b2bf19b9e53170ff8465c3fcc473af469005f07560d11f3bcdb` |
| message-logs-master | 7 | `d8bf49bfbdf5b89a382d38b2979ded5737bc8152dc819916bfee606ad8716d47` |
| message-logs-master | 8 | `e63958910fe90bece7cc674cba33e0cf9d0a0ebe29081b87910f396b3c56a1a6` |
| message-logs-api | 6 | `f50008d41fd21005116e51e27664c29578170f427a64ef3770e2586efd068587` |
| message-logs-api | 7 | `f24b7b07cb1e4fc34608923e33487c7988033a91842aa9cdd6cbcdbea4d1dfb6` |
| message-logs-api | 8 | `982aa6893abf3c87ecf01ec98243fdcf19e92281f4271a7164b65195b4ecda50` |
| message-logs-web | 6 | `64c90b0449049d258904d15dbbbf0e6c70e66bae601ae36bdc4256793c0c4ea7` |
| message-logs-web | 7 | `e64f1142fa00b1ad4ef6a1fb040b54c02f461df889e191ad355e6bc676be4419` |
| message-logs-web | 8 | `6ddd30810eb0451e7129167c5a016dbad81180d3cca32ece55e38660755eb1ea` |
| message-logs-web | 9 | `42e19449d4ca61910c2ce389f8b89d401923a6c5ee56dacd4d06f3f65086ea97` |
| message-logs-mobile | 9 | `f13fa4681bccda423a8d5b4564c309ed7c6c0382086578677f5669160ac75401` |
| message-logs-mobile | 10 | `19eb710e584d16a7b796a71a3a45e6609db6bddd2a4c78b291ae414e5c52d05a` |
| message-logs-mobile | 11 | `8123d8ac515f9a0fb92ce5c4ba29bb370697a9d8962e20db3b7038dcc04bc47f` |
