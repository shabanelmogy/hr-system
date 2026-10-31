<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Shared boolean field preparation Phase 04 - Domain Actions and Lifecycle

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

- **Shared boolean field preparation cross-platform master review:** `../modules/platform/features/angular-boolean-field-foundation/angular-boolean-field-foundation-review.md` sections 3, 4, 6, 7, 8
- **Shared boolean field preparation API implementation profile:** `../modules/platform/features/angular-boolean-field-foundation/angular-boolean-field-foundation-api.md` sections 6, 7, 8
- **Shared boolean field preparation Next.js implementation profile:** `../modules/platform/features/angular-boolean-field-foundation/angular-boolean-field-foundation-web.md` sections 6, 7, 8, 9
- **Shared boolean field preparation Expo implementation profile:** `../modules/platform/features/angular-boolean-field-foundation/angular-boolean-field-foundation-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-boolean-field-foundation-master | 3 | `105b60ee32d8146a8c49038186ebcbcba664c350b443092de86eea58e627d6cd` |
| angular-boolean-field-foundation-master | 4 | `ae0580508cdef5d62a38c6a271bbffb458db6607d6b003aced9625a17c049670` |
| angular-boolean-field-foundation-master | 6 | `d7f6f4307682c796c94479735e56a02e4f6fccbdf46208212ffcd6a662adee54` |
| angular-boolean-field-foundation-master | 7 | `8ecd38d30820550d928c2e3d9492bb9b2381fb8cba02032eff3bb01bbfde46e0` |
| angular-boolean-field-foundation-master | 8 | `653cc093d61e1ef12c7cebe2d2f0e0408d7c8eb7a561ba0993b8776d7a14b66b` |
| angular-boolean-field-foundation-api | 6 | `d7f6f4307682c796c94479735e56a02e4f6fccbdf46208212ffcd6a662adee54` |
| angular-boolean-field-foundation-api | 7 | `8ecd38d30820550d928c2e3d9492bb9b2381fb8cba02032eff3bb01bbfde46e0` |
| angular-boolean-field-foundation-api | 8 | `653cc093d61e1ef12c7cebe2d2f0e0408d7c8eb7a561ba0993b8776d7a14b66b` |
| angular-boolean-field-foundation-web | 6 | `d7f6f4307682c796c94479735e56a02e4f6fccbdf46208212ffcd6a662adee54` |
| angular-boolean-field-foundation-web | 7 | `8ecd38d30820550d928c2e3d9492bb9b2381fb8cba02032eff3bb01bbfde46e0` |
| angular-boolean-field-foundation-web | 8 | `653cc093d61e1ef12c7cebe2d2f0e0408d7c8eb7a561ba0993b8776d7a14b66b` |
| angular-boolean-field-foundation-web | 9 | `aeb73463a736e3afc44a5c8a0e4b87ec424d4cf94c519c925a73c44192ca73ed` |
| angular-boolean-field-foundation-mobile | 9 | `aeb73463a736e3afc44a5c8a0e4b87ec424d4cf94c519c925a73c44192ca73ed` |
| angular-boolean-field-foundation-mobile | 10 | `65025d0bddf1b98c587bd4cc2be53ffa24786df04ab9851b7f3666fa1c9d21d0` |
| angular-boolean-field-foundation-mobile | 11 | `a7500482bc0f7ba74d1dfaaaa201a2b834ef8d65330eec06b2b928a6b39933ff` |
