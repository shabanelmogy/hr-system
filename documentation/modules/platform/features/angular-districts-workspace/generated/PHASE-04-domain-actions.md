<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Districts complete Angular parity Phase 04 - Domain Actions and Lifecycle

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

- **Districts complete Angular parity cross-platform master review:** `../modules/platform/features/angular-districts-workspace/angular-districts-workspace-review.md` sections 3, 4, 6, 7, 8
- **Districts complete Angular parity API implementation profile:** `../modules/platform/features/angular-districts-workspace/angular-districts-workspace-api.md` sections 6, 7, 8
- **Districts complete Angular parity Next.js implementation profile:** `../modules/platform/features/angular-districts-workspace/angular-districts-workspace-web.md` sections 6, 7, 8, 9
- **Districts complete Angular parity Expo implementation profile:** `../modules/platform/features/angular-districts-workspace/angular-districts-workspace-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-districts-workspace-master | 3 | `2699da4d9c97c7c9e5bd04fcbeb2de97371c4fb14deb0b861e5daf1c09d3ff43` |
| angular-districts-workspace-master | 4 | `f28c9ed08d649377a2113ffb8d720da7b09fcb9f16238158dd1fbb12e4ff174e` |
| angular-districts-workspace-master | 6 | `2d7594d538e94b03e4b496a02d2755f2a96745a20d527229c8d1c3c48ce829b8` |
| angular-districts-workspace-master | 7 | `054cae3882dac8d5d142ce6057c742535ca9f3c8d375ec5621ae1c5fb6efc855` |
| angular-districts-workspace-master | 8 | `6b0affc4f5a9229dcc500e114b0b37d60b52eb819ec6219986706b3957ba65fb` |
| angular-districts-workspace-api | 6 | `2d7594d538e94b03e4b496a02d2755f2a96745a20d527229c8d1c3c48ce829b8` |
| angular-districts-workspace-api | 7 | `89f31137fe07f6a636a472ad76c9d93d20998759f0b819514504fbd798c88f82` |
| angular-districts-workspace-api | 8 | `6b0affc4f5a9229dcc500e114b0b37d60b52eb819ec6219986706b3957ba65fb` |
| angular-districts-workspace-web | 6 | `2d7594d538e94b03e4b496a02d2755f2a96745a20d527229c8d1c3c48ce829b8` |
| angular-districts-workspace-web | 7 | `054cae3882dac8d5d142ce6057c742535ca9f3c8d375ec5621ae1c5fb6efc855` |
| angular-districts-workspace-web | 8 | `6b0affc4f5a9229dcc500e114b0b37d60b52eb819ec6219986706b3957ba65fb` |
| angular-districts-workspace-web | 9 | `db4b325ac4030e9da6b16e3f937c8e096cb382b7d0237821d04ba61450a5923f` |
| angular-districts-workspace-mobile | 9 | `db4b325ac4030e9da6b16e3f937c8e096cb382b7d0237821d04ba61450a5923f` |
| angular-districts-workspace-mobile | 10 | `238aaba6b3f40c39dc608844d96971c0a35368f7cc1da44450383e2fadd8b0ba` |
| angular-districts-workspace-mobile | 11 | `61b0f90a550f98e596889d1ca889cdd0884d8b101d9d1a467eac82f7e358f7f7` |
