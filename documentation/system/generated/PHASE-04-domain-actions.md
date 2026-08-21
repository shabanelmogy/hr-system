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
- [ ] Import validates client limits before submitting and the API enforces its own limits.
- [ ] Client feedback uses stable server errors and localized fallback messages.

## Approved references

- **Countries cross-platform master review:** `../project/COUNTRIES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7, 8
- **Countries API implementation profile:** `../api/Countries_API_Implementation_Profile.md` sections 6, 7, 8
- **Countries Next.js implementation profile:** `../web-next/features/countries-frontend-reference.md` sections 6, 7, 8, 9
- **Countries Expo implementation profile:** `../mobile-react/countries-mobile-reference.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| master | 3 | `92135fc9b114e7094a6b019dbd6d9ee5c3a33641c4586487689d2b8f65255a5a` |
| master | 4 | `d37a682ba9744f70bdcbcc638c1e4478487a97d079da7960b292ae7746c784bd` |
| master | 6 | `e671cfed0bfb63b0063c4f83c86be605190925f9dc7e6b1ef6e335c26fb89c54` |
| master | 7 | `a569747a5ae09a0eb3f1619080e56572e4f79a0c722408583485e404f2654f8a` |
| master | 8 | `3a46a1a850e082e79228d9471dad600b673f71194b1aaf0156a0828f07f7ba8e` |
| api | 6 | `6f3fb6d8e004e407e57bb8e4c51596bd6d2de6377f7867c99b453ff882c3bc68` |
| api | 7 | `1ab9fa036b11c40090cb0b49890916d71ab6eedaf0ee99815a641c4fcd123237` |
| api | 8 | `19ba24881ed075978da2d89d9f5d6ac913ca8289d14d251464edfd93ab1e8c12` |
| web | 6 | `5603515b843af92bfacc318fcc08638b9af594e0cf20dd1ced247f3391193d63` |
| web | 7 | `927c7c852687f1abb0fecc2eab71536fd7445b0b8c6d5d4eaec32f1f09bcbb63` |
| web | 8 | `43a7e4cb95554e828d56afdc3c933a1b1f224531dc5829a1c6d0b31e25f632fe` |
| web | 9 | `0db892ec73f94ce8600765108ad41fd64cc85c1f726c6a60c7955cd80faa8091` |
| mobile | 9 | `5ef93ec2560d73ca4fd0f404d414633343637e2b68174c82c86c059bc49493da` |
| mobile | 10 | `7d90a6bd3148af61cc84222408c9349630432fd3c40780d755e1212ac0e76171` |
| mobile | 11 | `c40a360cd02c08732fae89e680c641e2a251a818b9e84456a47e618f84c7b8e5` |
