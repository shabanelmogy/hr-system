<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Angular Shared Theme and Action Control Phase 04 - Domain Actions and Lifecycle

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

- **Angular Shared Theme and Action Control cross-platform master review:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-review.md` sections 3, 4, 6, 7, 8
- **Angular Shared Theme and Action Control API implementation profile:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-api.md` sections 6, 7, 8
- **Angular Shared Theme and Action Control Next.js implementation profile:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-web.md` sections 6, 7, 8, 9
- **Angular Shared Theme and Action Control Expo implementation profile:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-theme-foundation-master | 3 | `071779e2c74d963bce39981ae360e9ad0206810e48a29edca4473916ce983c68` |
| angular-theme-foundation-master | 4 | `da77c409251d42150cbb611b466e34269a36e417e5afd3890a68836bf33243eb` |
| angular-theme-foundation-master | 6 | `c59b87b10fc969391f2d782547421b84c7d4b47bdf19df5f2b8485949b709791` |
| angular-theme-foundation-master | 7 | `74ab13bcbd7d84010d64cac92472527044e747aca5045560ab602ee00fb3a1d8` |
| angular-theme-foundation-master | 8 | `ea5867fdb4129cd10c2ee5662de83461d5cad88059d0057d0977147a1f1c022d` |
| angular-theme-foundation-api | 6 | `c59b87b10fc969391f2d782547421b84c7d4b47bdf19df5f2b8485949b709791` |
| angular-theme-foundation-api | 7 | `da4956afaa9062fa8fedffb54833d220162a47cf48b21bbfe045b1a913350911` |
| angular-theme-foundation-api | 8 | `ea5867fdb4129cd10c2ee5662de83461d5cad88059d0057d0977147a1f1c022d` |
| angular-theme-foundation-web | 6 | `c59b87b10fc969391f2d782547421b84c7d4b47bdf19df5f2b8485949b709791` |
| angular-theme-foundation-web | 7 | `74ab13bcbd7d84010d64cac92472527044e747aca5045560ab602ee00fb3a1d8` |
| angular-theme-foundation-web | 8 | `ea5867fdb4129cd10c2ee5662de83461d5cad88059d0057d0977147a1f1c022d` |
| angular-theme-foundation-web | 9 | `5291c967ab5ed5d278ffe583e1ff21d682be39afc96fb69800728b7da653b36b` |
| angular-theme-foundation-mobile | 9 | `5291c967ab5ed5d278ffe583e1ff21d682be39afc96fb69800728b7da653b36b` |
| angular-theme-foundation-mobile | 10 | `62ccb5d14f2b568616a3cf694d0418404fd96766ba7ca2f3a10538da44834953` |
| angular-theme-foundation-mobile | 11 | `58dc115e8092bcba8eba15cea9974b490796f1bb79ea8dcb5f57f9f9083b5e13` |
