<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Angular shared collection foundation Phase 04 - Domain Actions and Lifecycle

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

- **Angular shared collection foundation cross-platform master review:** `../modules/platform/features/angular-collection-foundation/angular-collection-foundation-review.md` sections 3, 4, 6, 7, 8
- **Angular shared collection foundation API implementation profile:** `../modules/platform/features/angular-collection-foundation/angular-collection-foundation-api.md` sections 6, 7, 8
- **Angular shared collection foundation Angular web implementation profile:** `../modules/platform/features/angular-collection-foundation/angular-collection-foundation-web.md` sections 6, 7, 8, 9
- **Angular shared collection foundation Expo implementation profile:** `../modules/platform/features/angular-collection-foundation/angular-collection-foundation-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-collection-foundation-master | 3 | `bdac0a1efba83f9b9d2427afe0d8495ba77c34ff3774897c9e6c43ed082a5dfa` |
| angular-collection-foundation-master | 4 | `3846922f56bb2f0dd5bc8f55b5c64f733b425d1ea2943bd56ea4c708751fc849` |
| angular-collection-foundation-master | 6 | `983ed69fcd0a2160a70725c73120734deec395f8025415ca5e46661d4fec6f25` |
| angular-collection-foundation-master | 7 | `5641f423c2c6f22020977d5980a19cea09f05fc56824c8f37a5db50819dfc9a1` |
| angular-collection-foundation-master | 8 | `c5930c59d67c5efccc1bda1aba04bdacb2ce11cb936ddfb4306e541ee2a782af` |
| angular-collection-foundation-api | 6 | `983ed69fcd0a2160a70725c73120734deec395f8025415ca5e46661d4fec6f25` |
| angular-collection-foundation-api | 7 | `5641f423c2c6f22020977d5980a19cea09f05fc56824c8f37a5db50819dfc9a1` |
| angular-collection-foundation-api | 8 | `c5930c59d67c5efccc1bda1aba04bdacb2ce11cb936ddfb4306e541ee2a782af` |
| angular-collection-foundation-web | 6 | `983ed69fcd0a2160a70725c73120734deec395f8025415ca5e46661d4fec6f25` |
| angular-collection-foundation-web | 7 | `5641f423c2c6f22020977d5980a19cea09f05fc56824c8f37a5db50819dfc9a1` |
| angular-collection-foundation-web | 8 | `c5930c59d67c5efccc1bda1aba04bdacb2ce11cb936ddfb4306e541ee2a782af` |
| angular-collection-foundation-web | 9 | `72b4e325040d35ad3426bf2fc0686fa85b299e5f2e349735a570c0cd93a88e25` |
| angular-collection-foundation-mobile | 9 | `72b4e325040d35ad3426bf2fc0686fa85b299e5f2e349735a570c0cd93a88e25` |
| angular-collection-foundation-mobile | 10 | `7653f373d77818eab834faf40a1877d9492456d68d7394c81de97df13dc9c17b` |
| angular-collection-foundation-mobile | 11 | `900f3d8706f3bbad21a81d915d3c5e875b5862f8c4f8df0f37d9834504346239` |
