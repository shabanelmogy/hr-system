<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Platform Browser Authentication Phase 04 - Domain Actions and Lifecycle

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

- **Platform Browser Authentication cross-platform master review:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-review.md` sections 3, 4, 6, 7, 8
- **Platform Browser Authentication API implementation profile:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-api.md` sections 6, 7, 8
- **Platform Browser Authentication Next.js implementation profile:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-web.md` sections 6, 7, 8, 9
- **Platform Browser Authentication Expo implementation profile:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| platform-browser-authentication-master | 3 | `345220b1eaa0e529ed3d55776cd852c9a5c82af7c4d7972601479aca3f55dc9f` |
| platform-browser-authentication-master | 4 | `0505f838bd9f13d3144554c0ec84c5ede68b9a4c88979c80f6692106e100f94f` |
| platform-browser-authentication-master | 6 | `3f6972c09887aa9b387d77f91d23c2f2e48de37583bdb9cc0506f94dd1d5a8c4` |
| platform-browser-authentication-master | 7 | `6390b0bf66b6037b53e9c024f398ba2c920c21acf87513c7525a99a3815032c9` |
| platform-browser-authentication-master | 8 | `337efcf914ffbb3bf125b9eaebfeee31f1e1f3fddd41b636684f13739eb950c2` |
| platform-browser-authentication-api | 6 | `0a34aee7b4d1e0ac784f4f0ade83e50ddf83b91678b6a3b4a8247bda1e8df0d9` |
| platform-browser-authentication-api | 7 | `0f32a5dfac86eff41cdc984b55819fb02961dc8219b55db378d3c29ec470e842` |
| platform-browser-authentication-api | 8 | `26cc4d301319e508521dc58bb8dcd580b32bb021be0b65eb63efb67d48ee244d` |
| platform-browser-authentication-web | 6 | `0cb8d282665eab10947f26d8e7f8b61da88e4b155927725acaa99ecfadb65506` |
| platform-browser-authentication-web | 7 | `63b256feb8056824a70b3d6140fa09878174c6a4b109f18fbbc1546166185502` |
| platform-browser-authentication-web | 8 | `3b480eab32b081a85dd0a739f8911bf49c01ab5032ce617f1d0330e32e9d0df6` |
| platform-browser-authentication-web | 9 | `a405ce7f7bc4b5c217e84ac35fc0eaae33cea91ec7ac4a2fb8c8afaf837b0496` |
| platform-browser-authentication-mobile | 9 | `ee88e7570c0c92759fc11905a984191f1b35504afdc1f82cffb14e21e514cabc` |
| platform-browser-authentication-mobile | 10 | `55671e8beaf38554eacb8d95c72da2780692ea162c3bb358796621f03d69cb8c` |
| platform-browser-authentication-mobile | 11 | `3b9b38136ee9eee63b85e9b06240286b646e8b78f3d34926eaea28e95760c620` |
