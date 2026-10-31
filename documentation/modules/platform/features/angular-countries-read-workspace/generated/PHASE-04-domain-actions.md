<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Countries read workspace Phase 04 - Domain Actions and Lifecycle

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

- **Countries read workspace cross-platform master review:** `../modules/platform/features/angular-countries-read-workspace/angular-countries-read-workspace-review.md` sections 3, 4, 6, 7, 8
- **Countries read workspace API implementation profile:** `../modules/platform/features/angular-countries-read-workspace/angular-countries-read-workspace-api.md` sections 6, 7, 8
- **Countries read workspace Next.js implementation profile:** `../modules/platform/features/angular-countries-read-workspace/angular-countries-read-workspace-web.md` sections 6, 7, 8, 9
- **Countries read workspace Expo implementation profile:** `../modules/platform/features/angular-countries-read-workspace/angular-countries-read-workspace-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-read-workspace-master | 3 | `900d99a68a5e3fb4b45f4d01d3278357a90c1bef05562b27edd672021635ebe6` |
| angular-countries-read-workspace-master | 4 | `73f5a7101a9e9f4423d8539c612013ba7eb1541d388fb44669919a8f2779bc62` |
| angular-countries-read-workspace-master | 6 | `4aa2e516e6ef412cfb58f2d8ccc71961358af0545fb78f9128ec63fdfa43b512` |
| angular-countries-read-workspace-master | 7 | `20af956b014674166cbc688b3813fff95ab1ed9a22bc27580172876834718601` |
| angular-countries-read-workspace-master | 8 | `9c477e9921fce73d5b4db42fb8fd55aa1152683205584719fbec91024291702d` |
| angular-countries-read-workspace-api | 6 | `4aa2e516e6ef412cfb58f2d8ccc71961358af0545fb78f9128ec63fdfa43b512` |
| angular-countries-read-workspace-api | 7 | `20af956b014674166cbc688b3813fff95ab1ed9a22bc27580172876834718601` |
| angular-countries-read-workspace-api | 8 | `9c477e9921fce73d5b4db42fb8fd55aa1152683205584719fbec91024291702d` |
| angular-countries-read-workspace-web | 6 | `4aa2e516e6ef412cfb58f2d8ccc71961358af0545fb78f9128ec63fdfa43b512` |
| angular-countries-read-workspace-web | 7 | `20af956b014674166cbc688b3813fff95ab1ed9a22bc27580172876834718601` |
| angular-countries-read-workspace-web | 8 | `9c477e9921fce73d5b4db42fb8fd55aa1152683205584719fbec91024291702d` |
| angular-countries-read-workspace-web | 9 | `9956bd77de0553081068027e0cf412fb7f2ac7d411995786f17e1f2d5ddd6c6d` |
| angular-countries-read-workspace-mobile | 9 | `9956bd77de0553081068027e0cf412fb7f2ac7d411995786f17e1f2d5ddd6c6d` |
| angular-countries-read-workspace-mobile | 10 | `351549c64b8a2862ebda6e01484037ddf3730522101fa8d1379a763aceb43ac9` |
| angular-countries-read-workspace-mobile | 11 | `66b7842c53fe3f6e2ca4d73e4eb31426c01e65b6f00d8e86203decd1cb992e3f` |
