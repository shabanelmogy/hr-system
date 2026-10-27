<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Platform Settings Phase 04 - Domain Actions and Lifecycle

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

- **Platform Settings cross-platform master review:** `../modules/platform/features/platform-settings/platform-settings-review.md` sections 3, 4, 6, 7, 8
- **Platform Settings API implementation profile:** `../modules/platform/features/platform-settings/platform-settings-api.md` sections 6, 7, 8
- **Platform Settings Next.js implementation profile:** `../modules/platform/features/platform-settings/platform-settings-web.md` sections 6, 7, 8, 9
- **Platform Settings Expo implementation profile:** `../modules/platform/features/platform-settings/platform-settings-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| platform-settings-master | 3 | `62db90956ab6487883efb3c81f5ef78e05f291c3128abba4724d1d8ee3263e86` |
| platform-settings-master | 4 | `1e6e30d327293c1ef34116ee5580e98d7b008fe943f3ebb221db1c5c4df40ea0` |
| platform-settings-master | 6 | `561a04d004f55425502034332d421de9b0ac65843d053222311168511572cd1f` |
| platform-settings-master | 7 | `ba48ae018c9641925daf2835ba4e18577f257124b3312244495b5ed7da6b1fad` |
| platform-settings-master | 8 | `b207c71783596108ff37a3faafaaa2b24852fc948f10c0fd6ea3920f6dd1ab0d` |
| platform-settings-api | 6 | `dbac0d62cb0b83825b86b158c13101cc7970cb631a6bbcdb9fbb4d01ef265121` |
| platform-settings-api | 7 | `e6bab648b8bd6dce24eb8630b58eac9e88a079b96c661cbbf447d9847f07ce82` |
| platform-settings-api | 8 | `b4b85b84dd4a6eb867090d3024f1aeac578479a819de55d47917502a6f02034e` |
| platform-settings-web | 6 | `2051ec846c5d94dbeda7401ad335d457073175de8bb34e5ba7ec6ad509303d1c` |
| platform-settings-web | 7 | `23505cc87ca18587bf0610b12a4e4528872c552baa185a1d1014ab5351f000dc` |
| platform-settings-web | 8 | `5b736cbade699cee98766cd89ff87ca5c6501f02d231619a70d433e4e032b3f1` |
| platform-settings-web | 9 | `314f6883b1b94e4595e2bc902e82d8f8342c5ce3c390b53c8f5f64de2498adcb` |
| platform-settings-mobile | 9 | `2bcad9792901da71b26b7978ae0d7f7c763f65656f89a808594d10921a5a89c3` |
| platform-settings-mobile | 10 | `5097ab4247ee0bbbcb1dc19bac0dd450f6d4d58cb8ae9780913c39608fa6342e` |
| platform-settings-mobile | 11 | `cd598a2c052fe27d3a4df855a05d01e7c846987f9f5a091d2350f1c2cab1623b` |
