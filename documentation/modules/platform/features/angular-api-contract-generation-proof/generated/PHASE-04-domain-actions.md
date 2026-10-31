<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Angular API contract generation compatibility proof Phase 04 - Domain Actions and Lifecycle

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

- **Angular API contract generation compatibility proof cross-platform master review:** `../modules/platform/features/angular-api-contract-generation-proof/angular-api-contract-generation-proof-review.md` sections 3, 4, 6, 7, 8
- **Angular API contract generation compatibility proof API implementation profile:** `../modules/platform/features/angular-api-contract-generation-proof/angular-api-contract-generation-proof-api.md` sections 6, 7, 8
- **Angular API contract generation compatibility proof Next.js implementation profile:** `../modules/platform/features/angular-api-contract-generation-proof/angular-api-contract-generation-proof-web.md` sections 6, 7, 8, 9
- **Angular API contract generation compatibility proof Expo implementation profile:** `../modules/platform/features/angular-api-contract-generation-proof/angular-api-contract-generation-proof-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-api-contract-generation-proof-master | 3 | `e315e31fc7b1aaeefa3db25c33d5acd3c3ace47d3fa8d611e04f0b744706fada` |
| angular-api-contract-generation-proof-master | 4 | `4ebed5f2b84b04bec2ea90dd08aa6fd428d9534cfc8ad1276b8ce46da124c4fc` |
| angular-api-contract-generation-proof-master | 6 | `b41e2c1eb859488b6ed13dca4845ef329fe82644f1c7c230f10482e4e863f650` |
| angular-api-contract-generation-proof-master | 7 | `56aba998ce7ccc78088ecbbcc5605381bfe63186119ea63a85a2b6e20ca68c32` |
| angular-api-contract-generation-proof-master | 8 | `fd292d3cec432f44bb98aceb506aa1d3f871da0aed1f145d4b1ce14bcd82c541` |
| angular-api-contract-generation-proof-api | 6 | `b41e2c1eb859488b6ed13dca4845ef329fe82644f1c7c230f10482e4e863f650` |
| angular-api-contract-generation-proof-api | 7 | `56aba998ce7ccc78088ecbbcc5605381bfe63186119ea63a85a2b6e20ca68c32` |
| angular-api-contract-generation-proof-api | 8 | `fd292d3cec432f44bb98aceb506aa1d3f871da0aed1f145d4b1ce14bcd82c541` |
| angular-api-contract-generation-proof-web | 6 | `b41e2c1eb859488b6ed13dca4845ef329fe82644f1c7c230f10482e4e863f650` |
| angular-api-contract-generation-proof-web | 7 | `56aba998ce7ccc78088ecbbcc5605381bfe63186119ea63a85a2b6e20ca68c32` |
| angular-api-contract-generation-proof-web | 8 | `fd292d3cec432f44bb98aceb506aa1d3f871da0aed1f145d4b1ce14bcd82c541` |
| angular-api-contract-generation-proof-web | 9 | `78ce449fad32387d28b10ac190a7b24314efa780388f75ebc4f3cd34c045783e` |
| angular-api-contract-generation-proof-mobile | 9 | `78ce449fad32387d28b10ac190a7b24314efa780388f75ebc4f3cd34c045783e` |
| angular-api-contract-generation-proof-mobile | 10 | `90e4bcdbf79b13aab5307175b41a047870abb2e21b858362cb7abed7fb17ffab` |
| angular-api-contract-generation-proof-mobile | 11 | `d7e05edb39ab6b7b9b9545940088a607a8d779f955d7fba4b7ae748bdf8c6e4d` |
