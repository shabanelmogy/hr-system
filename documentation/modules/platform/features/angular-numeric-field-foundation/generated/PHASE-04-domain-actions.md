<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Shared numeric field preparation Phase 04 - Domain Actions and Lifecycle

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

- **Shared numeric field preparation cross-platform master review:** `../modules/platform/features/angular-numeric-field-foundation/angular-numeric-field-foundation-review.md` sections 3, 4, 6, 7, 8
- **Shared numeric field preparation API implementation profile:** `../modules/platform/features/angular-numeric-field-foundation/angular-numeric-field-foundation-api.md` sections 6, 7, 8
- **Shared numeric field preparation Next.js implementation profile:** `../modules/platform/features/angular-numeric-field-foundation/angular-numeric-field-foundation-web.md` sections 6, 7, 8, 9
- **Shared numeric field preparation Expo implementation profile:** `../modules/platform/features/angular-numeric-field-foundation/angular-numeric-field-foundation-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-numeric-field-foundation-master | 3 | `a50c22c49537c886bb84e2789f3d24298e83a88fe2487e956e0bf5f20be556c7` |
| angular-numeric-field-foundation-master | 4 | `edd3f9b373462b8ac2e64a379419a7edef45614e218a0945bee7f04a1b1c1ff9` |
| angular-numeric-field-foundation-master | 6 | `90b3b447db8e251821cbabd42393b6d0c97cc58f0052d655106388445265d12c` |
| angular-numeric-field-foundation-master | 7 | `11121dae5fcc238d7bb7f4cc47b7e1327f9537faa434a5060adf9297b801985d` |
| angular-numeric-field-foundation-master | 8 | `cf660dea88733a16bc9c17ce4231c1fba6e5afc89865ef26e10d334ba735be9a` |
| angular-numeric-field-foundation-api | 6 | `90b3b447db8e251821cbabd42393b6d0c97cc58f0052d655106388445265d12c` |
| angular-numeric-field-foundation-api | 7 | `11121dae5fcc238d7bb7f4cc47b7e1327f9537faa434a5060adf9297b801985d` |
| angular-numeric-field-foundation-api | 8 | `cf660dea88733a16bc9c17ce4231c1fba6e5afc89865ef26e10d334ba735be9a` |
| angular-numeric-field-foundation-web | 6 | `90b3b447db8e251821cbabd42393b6d0c97cc58f0052d655106388445265d12c` |
| angular-numeric-field-foundation-web | 7 | `11121dae5fcc238d7bb7f4cc47b7e1327f9537faa434a5060adf9297b801985d` |
| angular-numeric-field-foundation-web | 8 | `cf660dea88733a16bc9c17ce4231c1fba6e5afc89865ef26e10d334ba735be9a` |
| angular-numeric-field-foundation-web | 9 | `ce837fa5be7fa391f4de61e5ec453337c57b3171ba9948aa2f36bebc0ceaf8d0` |
| angular-numeric-field-foundation-mobile | 9 | `ce837fa5be7fa391f4de61e5ec453337c57b3171ba9948aa2f36bebc0ceaf8d0` |
| angular-numeric-field-foundation-mobile | 10 | `0bd7827ed769528e2ab4bb6c555c68c6ba376f2c580ed0da78d2aaba1aeae03c` |
| angular-numeric-field-foundation-mobile | 11 | `c05dd60d5967720bf86a0cf631db3fd61c433ee0edb31e9aacf9fe38cfc97bcc` |
