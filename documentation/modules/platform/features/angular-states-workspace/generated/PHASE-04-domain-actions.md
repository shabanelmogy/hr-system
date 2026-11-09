<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# States complete Angular parity Phase 04 - Domain Actions and Lifecycle

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

- **States complete Angular parity cross-platform master review:** `../modules/platform/features/angular-states-workspace/angular-states-workspace-review.md` sections 3, 4, 6, 7, 8
- **States complete Angular parity API implementation profile:** `../modules/platform/features/angular-states-workspace/angular-states-workspace-api.md` sections 6, 7, 8
- **States complete Angular parity Next.js implementation profile:** `../modules/platform/features/angular-states-workspace/angular-states-workspace-web.md` sections 6, 7, 8, 9
- **States complete Angular parity Expo implementation profile:** `../modules/platform/features/angular-states-workspace/angular-states-workspace-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-states-workspace-master | 3 | `ac8493dff376e3675b110f0c643799f1d399b3d40516092c4e7b6392278b5bc8` |
| angular-states-workspace-master | 4 | `337cd6781195f95a821c1ce670cfe9c86930d82007f1e1152f2b9855e12cefd1` |
| angular-states-workspace-master | 6 | `f1fa81a7964badb1ca8ccf5e92bac1822e68362601b9fc3708f45b3048f97f5b` |
| angular-states-workspace-master | 7 | `501a10a08c373e454ebac69f367245279aecf89c8a2b9c44928c8a67c720c492` |
| angular-states-workspace-master | 8 | `a2711720a0f2987543734da15a69eb1eb2596157145afa8a1fc4e852ea8d6ab5` |
| angular-states-workspace-api | 6 | `f1fa81a7964badb1ca8ccf5e92bac1822e68362601b9fc3708f45b3048f97f5b` |
| angular-states-workspace-api | 7 | `7584691b6644143db3b466beaf52ff38ce7802770143b488a1cf4cc9ed53251b` |
| angular-states-workspace-api | 8 | `a2711720a0f2987543734da15a69eb1eb2596157145afa8a1fc4e852ea8d6ab5` |
| angular-states-workspace-web | 6 | `f1fa81a7964badb1ca8ccf5e92bac1822e68362601b9fc3708f45b3048f97f5b` |
| angular-states-workspace-web | 7 | `501a10a08c373e454ebac69f367245279aecf89c8a2b9c44928c8a67c720c492` |
| angular-states-workspace-web | 8 | `a2711720a0f2987543734da15a69eb1eb2596157145afa8a1fc4e852ea8d6ab5` |
| angular-states-workspace-web | 9 | `a300cf55dc219cefbfc033db706b12fccb640c2805d7cd8e010ccea1c298a2bb` |
| angular-states-workspace-mobile | 9 | `a300cf55dc219cefbfc033db706b12fccb640c2805d7cd8e010ccea1c298a2bb` |
| angular-states-workspace-mobile | 10 | `cfcb30676c9971033e8d24fc22f39d3237f9e9670bb15aaf3a663f2063d751ad` |
| angular-states-workspace-mobile | 11 | `98b658eb4d1191f2dac57864eb9a8bc49d409da4227e35893994fddfc9f71d45` |
