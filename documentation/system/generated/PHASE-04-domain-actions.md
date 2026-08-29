<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Phase 04 - Domain Actions and Lifecycle

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

- **Countries cross-platform master review:** `../project/COUNTRIES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7, 8
- **Countries API implementation profile:** `../api/Countries_API_Implementation_Profile.md` sections 6, 7, 8
- **Countries Next.js implementation profile:** `../web-next/features/countries-frontend-reference.md` sections 6, 7, 8, 9
- **Countries Expo implementation profile:** `../mobile-react/countries-mobile-reference.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| master | 3 | `568e3d2c75c5638278267aac6b86e3f011aee7a067e6fbd63add8f2b1312f60b` |
| master | 4 | `640408799d07c9939468c39e65e9d2601daa6e89d7896f24b13a924f4ecbb04d` |
| master | 6 | `b7fb453c6be690cf10f98e85664f30fb55fb590e628b0f8a0435f54cf67058ac` |
| master | 7 | `8c0ba157ab3e6ca7bfa97bd23bdd022523f69dc7ac4386e25462b7ad667ba74b` |
| master | 8 | `a108ec6b97e876d70a3958b477a3e44dccfbb7e78698a236224a91f36ec2db6b` |
| api | 6 | `bd3c45a99368c9ec22533cb308e8d4e81d0bdf89dad6e2e256d47128c466d32b` |
| api | 7 | `c08a8502696b8c144ec7a0dddf90d1941eddeece53a3612740c9675957f41930` |
| api | 8 | `6ba0561bbba0e93a7ce34482ec27b468c6d56b5255c755acb11d8b29f74bb994` |
| web | 6 | `90759ad423b1224c2285653dcb646b68398ac0418ac66869a8c0d1dc04534ef4` |
| web | 7 | `f9f1e9693346be686ff0effa80374e6f012a385ee00d622e1a3df1168dd8126a` |
| web | 8 | `43a7e4cb95554e828d56afdc3c933a1b1f224531dc5829a1c6d0b31e25f632fe` |
| web | 9 | `4da29b144dca03553c2568393fde9b32e14b1782bcd53ce7244453d4c9510f97` |
| mobile | 9 | `623e8dfe26f3d5b874a1785d7c2a545a519ddbbd1ad41e34765322988d7d4df6` |
| mobile | 10 | `7d90a6bd3148af61cc84222408c9349630432fd3c40780d755e1212ac0e76171` |
| mobile | 11 | `6713a595a06dae100c2d8f6e08528cf24699bc5a12d243524b2c02d8a5d837e3` |
