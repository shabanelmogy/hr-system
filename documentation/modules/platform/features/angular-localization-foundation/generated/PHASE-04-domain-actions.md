<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Angular Toolchain and Localization Runtime Phase 04 - Domain Actions and Lifecycle

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

- **Angular Toolchain and Localization Runtime cross-platform master review:** `../modules/platform/features/angular-localization-foundation/angular-localization-foundation-review.md` sections 3, 4, 6, 7, 8
- **Angular Toolchain and Localization Runtime API implementation profile:** `../modules/platform/features/angular-localization-foundation/angular-localization-foundation-api.md` sections 6, 7, 8
- **Angular localization foundation Angular Web profile:** `../modules/platform/features/angular-localization-foundation/angular-localization-foundation-web.md` sections 6, 7, 8, 9
- **Angular Toolchain and Localization Runtime Expo implementation profile:** `../modules/platform/features/angular-localization-foundation/angular-localization-foundation-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-localization-foundation-master | 3 | `ce20c23bd1cc943f42290794831e6b0955bf48b4df3fb4f72e5e13d85673593f` |
| angular-localization-foundation-master | 4 | `2345e4c0df8f384bba2a2b07fe7e9f102ba3b93096314d620fa8be452461ed41` |
| angular-localization-foundation-master | 6 | `7ef4ef81649a5cf87f78af83589a72bb1d3575294e98efe4da414ab698114f3e` |
| angular-localization-foundation-master | 7 | `c1f5c712a2d2529993fc7f4ac45fc8d015ad29fd934eadae86a2c98f7db5df49` |
| angular-localization-foundation-master | 8 | `ea76c301cccd425a113f3f51a0a51d3aef602e51c8b606d67dcad157be30c5cc` |
| angular-localization-foundation-api | 6 | `7ef4ef81649a5cf87f78af83589a72bb1d3575294e98efe4da414ab698114f3e` |
| angular-localization-foundation-api | 7 | `8c581f0b98813d93d3a19d6fafe4b3a433ef580492909f9e160f86cdc1ff0493` |
| angular-localization-foundation-api | 8 | `ea76c301cccd425a113f3f51a0a51d3aef602e51c8b606d67dcad157be30c5cc` |
| angular-localization-foundation-web | 6 | `7ef4ef81649a5cf87f78af83589a72bb1d3575294e98efe4da414ab698114f3e` |
| angular-localization-foundation-web | 7 | `c1f5c712a2d2529993fc7f4ac45fc8d015ad29fd934eadae86a2c98f7db5df49` |
| angular-localization-foundation-web | 8 | `ea76c301cccd425a113f3f51a0a51d3aef602e51c8b606d67dcad157be30c5cc` |
| angular-localization-foundation-web | 9 | `46fb0447edae1fca09c9986213d9472d157e56cc4c960a40aced27e409d47265` |
| angular-localization-foundation-mobile | 9 | `46fb0447edae1fca09c9986213d9472d157e56cc4c960a40aced27e409d47265` |
| angular-localization-foundation-mobile | 10 | `fe7928624f22f08764dcf7e54d5651be2cb0f41f1930ac527aaa94e00a35faf6` |
| angular-localization-foundation-mobile | 11 | `5dab27474a1b99ba062fd373bdbdb3dd3a8a6fe523b6dbf3da6991fc4335f10e` |
