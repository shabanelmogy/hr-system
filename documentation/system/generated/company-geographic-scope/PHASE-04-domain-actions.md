<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Company Geographic Scope Phase 04 - Domain Actions and Lifecycle

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

- **Company Geographic Scope cross-platform master review:** `../project/COMPANY_GEOGRAPHIC_SCOPE_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7, 8
- **Company Geographic Scope API implementation profile:** `../api/CompanyGeographicScope_API_Implementation_Profile.md` sections 6, 7, 8
- **Company Geographic Scope Next.js implementation profile:** `../web-next/features/company-geographic-scope-frontend-reference.md` sections 6, 7, 8, 9
- **Company Geographic Scope Expo implementation profile:** `../mobile-react/company-geographic-scope-mobile-reference.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-geographic-scope-master | 3 | `1eddc721d6657a5c21b9d719373cc2c21b1cd4c4e5da06db8520db87a76d2c77` |
| company-geographic-scope-master | 4 | `8a793aa6af268801e0554b7339d3c2a20a793da042b2ada9e9688180a6e1331b` |
| company-geographic-scope-master | 6 | `92d260cdc23463e140aee8d219007e899e8cae69c926cc42eefd62f198ac4f06` |
| company-geographic-scope-master | 7 | `ac1df7984c1421dcc4decfb548cab2e1c25325bb3d8dfb0be5d5f83b305a926e` |
| company-geographic-scope-master | 8 | `0012520feb870ae44a0e4e11bf75cf50f98a8a51d756a85ddbdeee5a443b9d0b` |
| company-geographic-scope-api | 6 | `1bd412614faadc55361e9404e5ef7bbbfa550eea95aa859f57f7823579fca834` |
| company-geographic-scope-api | 7 | `6029708d675d07c2d68b04b95cde352e14d8e33cd53477da1a1b62867bc5c2e3` |
| company-geographic-scope-api | 8 | `bfa505287d661d283b0aa02f52e340f7d6fd52b22e9dfa42ad19350143811147` |
| company-geographic-scope-web | 6 | `41d076d57d634f178516e7d44bd4130d65a077fd90b8af8ec4393639161199cd` |
| company-geographic-scope-web | 7 | `a1d2dff67a286d586bbfc2a669c49253e86ee6f048e9ba66fc5a47911b4e7a8b` |
| company-geographic-scope-web | 8 | `8b613d00bd6755da54d5ad7fd59560bf3ee5302139e4e91bf8dc6abf221a014d` |
| company-geographic-scope-web | 9 | `51536e77c2451697af22e2e1645199cf228217eb192e7954d58827bdebfe0893` |
| company-geographic-scope-mobile | 9 | `19987636dcb8207d611b556d35c73b73354b7911b848189ed3b4b9ac7459059d` |
| company-geographic-scope-mobile | 10 | `f375fdb887b65c19f6c2b8338a7758f5b820cda56bfd0f5918f5bd87816f50ba` |
| company-geographic-scope-mobile | 11 | `e662955d031606b0591f09c9827e45ea328b5c45f28faec7fe1ad21798cc83b9` |
