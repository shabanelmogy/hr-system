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
| company-geographic-scope-master | 3 | `9ec15c72949a18d28967bf33b8be561db54b6bbe9511861f83fce9b7bbb4f182` |
| company-geographic-scope-master | 4 | `8185c0aac290bcb1ea4cb2e37b929a12ecd0992abfd64e7ca399982ee2053de1` |
| company-geographic-scope-master | 6 | `9af33779eb8e399a26aa1fbde2585ba40dcd0fad4f6223030372c15c0aec6c20` |
| company-geographic-scope-master | 7 | `4aabfce40f78278ebe9253ba61344d31ffa99b0fc6fb6aca579a2125cdcac9c6` |
| company-geographic-scope-master | 8 | `52c5729920d1a17b5253d2c31a2f15d5ec1b1ea1094504a0ad5bf48d986cb191` |
| company-geographic-scope-api | 6 | `c139c71cf063df5fb71a7672b29958ccc7616ada201374b9539e2c60ac2149c9` |
| company-geographic-scope-api | 7 | `aa0e0f87e1c8636f81cd1fa33aefcc0c4b9f11c0c72b584a51da9dbbb2c51c3c` |
| company-geographic-scope-api | 8 | `bfa505287d661d283b0aa02f52e340f7d6fd52b22e9dfa42ad19350143811147` |
| company-geographic-scope-web | 6 | `156fd2d38448a65011a95c4ed1b37f631c20c4851be8ed6cd40976bd07856b88` |
| company-geographic-scope-web | 7 | `a1d2dff67a286d586bbfc2a669c49253e86ee6f048e9ba66fc5a47911b4e7a8b` |
| company-geographic-scope-web | 8 | `8b613d00bd6755da54d5ad7fd59560bf3ee5302139e4e91bf8dc6abf221a014d` |
| company-geographic-scope-web | 9 | `51536e77c2451697af22e2e1645199cf228217eb192e7954d58827bdebfe0893` |
| company-geographic-scope-mobile | 9 | `19987636dcb8207d611b556d35c73b73354b7911b848189ed3b4b9ac7459059d` |
| company-geographic-scope-mobile | 10 | `f375fdb887b65c19f6c2b8338a7758f5b820cda56bfd0f5918f5bd87816f50ba` |
| company-geographic-scope-mobile | 11 | `e662955d031606b0591f09c9827e45ea328b5c45f28faec7fe1ad21798cc83b9` |
