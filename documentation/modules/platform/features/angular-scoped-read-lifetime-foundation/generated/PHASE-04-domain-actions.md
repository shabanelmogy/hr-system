<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Shared scoped read lifecycle preparation Phase 04 - Domain Actions and Lifecycle

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

- **Shared scoped read lifecycle preparation cross-platform master review:** `../modules/platform/features/angular-scoped-read-lifetime-foundation/angular-scoped-read-lifetime-foundation-review.md` sections 3, 4, 6, 7, 8
- **Shared scoped read lifecycle preparation API implementation profile:** `../modules/platform/features/angular-scoped-read-lifetime-foundation/angular-scoped-read-lifetime-foundation-api.md` sections 6, 7, 8
- **Shared scoped read lifecycle preparation Next.js implementation profile:** `../modules/platform/features/angular-scoped-read-lifetime-foundation/angular-scoped-read-lifetime-foundation-web.md` sections 6, 7, 8, 9
- **Shared scoped read lifecycle preparation Expo implementation profile:** `../modules/platform/features/angular-scoped-read-lifetime-foundation/angular-scoped-read-lifetime-foundation-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-scoped-read-lifetime-foundation-master | 3 | `1cf14f0f0e123856ed661ef55f6d39ef96b02e0702b89675460f60523f358baf` |
| angular-scoped-read-lifetime-foundation-master | 4 | `fe22ce8087188029336855eb16ec1e82797e034f78d0a17de9ebcfe967f56835` |
| angular-scoped-read-lifetime-foundation-master | 6 | `b1ed3701da1066a418fd9708b7074be2ee8ec02e1aec3eae95b3a5fd7932e45f` |
| angular-scoped-read-lifetime-foundation-master | 7 | `0e2559819911bcd2239cd56e19d5829f4de4f8bc29794dc7b1a0745ebd677f26` |
| angular-scoped-read-lifetime-foundation-master | 8 | `1f828870c40492b5373285085bdbdd3baed7160e0ab16279f29f7886293254c9` |
| angular-scoped-read-lifetime-foundation-api | 6 | `b1ed3701da1066a418fd9708b7074be2ee8ec02e1aec3eae95b3a5fd7932e45f` |
| angular-scoped-read-lifetime-foundation-api | 7 | `0e2559819911bcd2239cd56e19d5829f4de4f8bc29794dc7b1a0745ebd677f26` |
| angular-scoped-read-lifetime-foundation-api | 8 | `1f828870c40492b5373285085bdbdd3baed7160e0ab16279f29f7886293254c9` |
| angular-scoped-read-lifetime-foundation-web | 6 | `b1ed3701da1066a418fd9708b7074be2ee8ec02e1aec3eae95b3a5fd7932e45f` |
| angular-scoped-read-lifetime-foundation-web | 7 | `0e2559819911bcd2239cd56e19d5829f4de4f8bc29794dc7b1a0745ebd677f26` |
| angular-scoped-read-lifetime-foundation-web | 8 | `1f828870c40492b5373285085bdbdd3baed7160e0ab16279f29f7886293254c9` |
| angular-scoped-read-lifetime-foundation-web | 9 | `40c959e2c189d36d2616af34473c0acaf8e389ee88a9844d27c10ac7767682ef` |
| angular-scoped-read-lifetime-foundation-mobile | 9 | `40c959e2c189d36d2616af34473c0acaf8e389ee88a9844d27c10ac7767682ef` |
| angular-scoped-read-lifetime-foundation-mobile | 10 | `0375ed805314d411457a3111f0e06abbc07908f2541f02c9588a834a24f36b52` |
| angular-scoped-read-lifetime-foundation-mobile | 11 | `e26d99a0a657ccafbb59bd2de87c3d7f447cf25a3239c9ea26f0a39b952de8fc` |
