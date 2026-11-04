<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Countries complete Angular pilot acceptance Phase 04 - Domain Actions and Lifecycle

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

- **Countries complete Angular pilot acceptance cross-platform master review:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-review.md` sections 3, 4, 6, 7, 8
- **Countries complete Angular pilot acceptance API implementation profile:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-api.md` sections 6, 7, 8
- **Countries complete Angular pilot acceptance Angular implementation profile:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-web.md` sections 6, 7, 8, 9
- **Countries complete Angular pilot acceptance Expo implementation profile:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-pilot-acceptance-master | 3 | `b60535df6f9174010782baed9e03af94042513e518fbed7418618c315f46c337` |
| angular-countries-pilot-acceptance-master | 4 | `c2f924e767e6c47bb155a02081c795e3c9aa9c9353c65741237a4cc9cbd6ab42` |
| angular-countries-pilot-acceptance-master | 6 | `5fa79433edfee936f81b6259cb61c3c72bd3795b68c54b038bb614b08ca4d730` |
| angular-countries-pilot-acceptance-master | 7 | `a0871f0deb9d51fd5188b394318ddd8452ad5c770fb4b980cd4c32e02958aac9` |
| angular-countries-pilot-acceptance-master | 8 | `8ff9f73d158c003b1de9fa565cc3db69c532b5fa764765f86113ecc3c93907f6` |
| angular-countries-pilot-acceptance-api | 6 | `5fa79433edfee936f81b6259cb61c3c72bd3795b68c54b038bb614b08ca4d730` |
| angular-countries-pilot-acceptance-api | 7 | `a0871f0deb9d51fd5188b394318ddd8452ad5c770fb4b980cd4c32e02958aac9` |
| angular-countries-pilot-acceptance-api | 8 | `8ff9f73d158c003b1de9fa565cc3db69c532b5fa764765f86113ecc3c93907f6` |
| angular-countries-pilot-acceptance-web | 6 | `5fa79433edfee936f81b6259cb61c3c72bd3795b68c54b038bb614b08ca4d730` |
| angular-countries-pilot-acceptance-web | 7 | `a0871f0deb9d51fd5188b394318ddd8452ad5c770fb4b980cd4c32e02958aac9` |
| angular-countries-pilot-acceptance-web | 8 | `8ff9f73d158c003b1de9fa565cc3db69c532b5fa764765f86113ecc3c93907f6` |
| angular-countries-pilot-acceptance-web | 9 | `cfd45c94e6f6655bf42151bf457b3a824ed4ea45c44bc9133a0b327d6f1c70f2` |
| angular-countries-pilot-acceptance-mobile | 9 | `273430a31e8dfebb4892fa3eee119c3fa8fa10cdca2150eaceb66f2c4f011f09` |
| angular-countries-pilot-acceptance-mobile | 10 | `d1a06262f8795fb1ee2a0572659d4da0f78a671c275fd7e0da2e52b9faba600f` |
| angular-countries-pilot-acceptance-mobile | 11 | `6282d9e0aadf0205a7879543ba007e253c4fc0580578ea83e1ccfc29af98b94c` |
