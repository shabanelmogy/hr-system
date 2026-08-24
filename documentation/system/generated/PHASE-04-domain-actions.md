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
- Cache invalidation and list-selection cleanup in both clients.
- Success, partial failure, all-or-nothing, idempotent, and retry outcomes.

## Exit checks

- [ ] UI visibility is not the only authorization boundary.
- [ ] Archived records cannot enter active-only flows.
- [ ] Restore behavior is explicit and tested.
- [ ] Bulk operations do not silently ignore invalid or duplicated identifiers.
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
| master | 3 | `b0ae30454b32e1209cd9b74f1bc82d45e58ae969a61381a25c64c86db7b09dfc` |
| master | 4 | `a9c88864fafde572fc0ffc1502f1a5ccb2fc55fdbd77aefe2c54c33d143b9529` |
| master | 6 | `e671cfed0bfb63b0063c4f83c86be605190925f9dc7e6b1ef6e335c26fb89c54` |
| master | 7 | `8c0ba157ab3e6ca7bfa97bd23bdd022523f69dc7ac4386e25462b7ad667ba74b` |
| master | 8 | `3ae10df4c368090fefdc97c36334b2baf8033ceb63c1eef8565258ee39ea3274` |
| api | 6 | `8952e197e5708d48511b6ae5a0a36fcaeea05bd39c757596f0ad190592ef5a29` |
| api | 7 | `1ab9fa036b11c40090cb0b49890916d71ab6eedaf0ee99815a641c4fcd123237` |
| api | 8 | `19ba24881ed075978da2d89d9f5d6ac913ca8289d14d251464edfd93ab1e8c12` |
| web | 6 | `5603515b843af92bfacc318fcc08638b9af594e0cf20dd1ced247f3391193d63` |
| web | 7 | `f9f1e9693346be686ff0effa80374e6f012a385ee00d622e1a3df1168dd8126a` |
| web | 8 | `43a7e4cb95554e828d56afdc3c933a1b1f224531dc5829a1c6d0b31e25f632fe` |
| web | 9 | `2e1b004b06ae6403aa3ffdae146f851381c08bcab5040da2a8fe50638904f045` |
| mobile | 9 | `5ef93ec2560d73ca4fd0f404d414633343637e2b68174c82c86c059bc49493da` |
| mobile | 10 | `7d90a6bd3148af61cc84222408c9349630432fd3c40780d755e1212ac0e76171` |
| mobile | 11 | `6713a595a06dae100c2d8f6e08528cf24699bc5a12d243524b2c02d8a5d837e3` |
