<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# System log collection consistency Phase 04 - Domain Actions and Lifecycle

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

- **System log collection consistency cross-platform master review:** `../modules/platform/features/angular-system-log-collection-consistency/angular-system-log-collection-consistency-review.md` sections 3, 4, 6, 7, 8
- **System log collection consistency API implementation profile:** `../modules/platform/features/angular-system-log-collection-consistency/angular-system-log-collection-consistency-api.md` sections 6, 7, 8
- **System log collection consistency Next.js implementation profile:** `../modules/platform/features/angular-system-log-collection-consistency/angular-system-log-collection-consistency-web.md` sections 6, 7, 8, 9
- **System log collection consistency Expo implementation profile:** `../modules/platform/features/angular-system-log-collection-consistency/angular-system-log-collection-consistency-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-log-collection-consistency-master | 3 | `12f111595614ea950811c077c53358a01b7ab5260509170b9288d2466e8fed93` |
| angular-system-log-collection-consistency-master | 4 | `48c9478184f5033a48097e62acc5a2b2bd1e174bb765f79f6cc76529c724ed2f` |
| angular-system-log-collection-consistency-master | 6 | `191b49556278f89e498ed723a4a08d42cc1013ffb4e628050059a6700b74d79d` |
| angular-system-log-collection-consistency-master | 7 | `260ff8388a7a43e7e9e6e645ce76762eadc8407569b146300d93b6bd9ed6ec89` |
| angular-system-log-collection-consistency-master | 8 | `93e012929f86efae1c41d1bb5229dc18332bb0ba8c1edd71eacd06812fbb5a5d` |
| angular-system-log-collection-consistency-api | 6 | `191b49556278f89e498ed723a4a08d42cc1013ffb4e628050059a6700b74d79d` |
| angular-system-log-collection-consistency-api | 7 | `260ff8388a7a43e7e9e6e645ce76762eadc8407569b146300d93b6bd9ed6ec89` |
| angular-system-log-collection-consistency-api | 8 | `93e012929f86efae1c41d1bb5229dc18332bb0ba8c1edd71eacd06812fbb5a5d` |
| angular-system-log-collection-consistency-web | 6 | `191b49556278f89e498ed723a4a08d42cc1013ffb4e628050059a6700b74d79d` |
| angular-system-log-collection-consistency-web | 7 | `260ff8388a7a43e7e9e6e645ce76762eadc8407569b146300d93b6bd9ed6ec89` |
| angular-system-log-collection-consistency-web | 8 | `93e012929f86efae1c41d1bb5229dc18332bb0ba8c1edd71eacd06812fbb5a5d` |
| angular-system-log-collection-consistency-web | 9 | `8211a083005f754d21dfa0bd936831bb555e61db53028af36cbc795838d56f79` |
| angular-system-log-collection-consistency-mobile | 9 | `8211a083005f754d21dfa0bd936831bb555e61db53028af36cbc795838d56f79` |
| angular-system-log-collection-consistency-mobile | 10 | `f58efe9c771befa7aaf5130a56df6fce26a6cea8aa27f40edb6c4155c0b63b54` |
| angular-system-log-collection-consistency-mobile | 11 | `613af3d9d0b6f6423157ad14b5562c697d985c7fbbd14178956312e386c51898` |
