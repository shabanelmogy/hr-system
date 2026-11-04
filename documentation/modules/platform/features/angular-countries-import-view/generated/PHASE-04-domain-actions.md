<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Countries XLSX import Phase 04 - Domain Actions and Lifecycle

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

- **Countries XLSX import cross-platform master review:** `../modules/platform/features/angular-countries-import-view/angular-countries-import-view-review.md` sections 3, 4, 6, 7, 8
- **Countries XLSX import API implementation profile:** `../modules/platform/features/angular-countries-import-view/angular-countries-import-view-api.md` sections 6, 7, 8
- **Countries XLSX import Angular implementation profile:** `../modules/platform/features/angular-countries-import-view/angular-countries-import-view-web.md` sections 6, 7, 8, 9
- **Countries XLSX import Expo implementation profile:** `../modules/platform/features/angular-countries-import-view/angular-countries-import-view-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-import-view-master | 3 | `78341b642b12c6c18a3247c7846ae2be0cff8c1786062f41075aa895918f5dc3` |
| angular-countries-import-view-master | 4 | `53e60870bac7336b7b85981032dd3b9944a2a288a91459982cb0a8c20142c42c` |
| angular-countries-import-view-master | 6 | `3cb1ce59d5da20c1c670d16496538c270effb436933ee0e13048f912397e6a61` |
| angular-countries-import-view-master | 7 | `d667c3b49da126015c07b08178f7c3e09adbff8f2ec2eb39ef3b1f4aa520e1a4` |
| angular-countries-import-view-master | 8 | `b3c4409235a89b89abcc628d2a834a38b5c30d5793e24bfb207a2c9bcd6f1677` |
| angular-countries-import-view-api | 6 | `3cb1ce59d5da20c1c670d16496538c270effb436933ee0e13048f912397e6a61` |
| angular-countries-import-view-api | 7 | `d667c3b49da126015c07b08178f7c3e09adbff8f2ec2eb39ef3b1f4aa520e1a4` |
| angular-countries-import-view-api | 8 | `b3c4409235a89b89abcc628d2a834a38b5c30d5793e24bfb207a2c9bcd6f1677` |
| angular-countries-import-view-web | 6 | `3cb1ce59d5da20c1c670d16496538c270effb436933ee0e13048f912397e6a61` |
| angular-countries-import-view-web | 7 | `d667c3b49da126015c07b08178f7c3e09adbff8f2ec2eb39ef3b1f4aa520e1a4` |
| angular-countries-import-view-web | 8 | `b3c4409235a89b89abcc628d2a834a38b5c30d5793e24bfb207a2c9bcd6f1677` |
| angular-countries-import-view-web | 9 | `bbba187c534e0637214cb864a3f268ffdf3dca121eaad7f9d413334fe10dea0d` |
| angular-countries-import-view-mobile | 9 | `bbba187c534e0637214cb864a3f268ffdf3dca121eaad7f9d413334fe10dea0d` |
| angular-countries-import-view-mobile | 10 | `47e64969da4971e661128ac73ad0f901ccfd17949c2856ffdd37c0c37bda76c3` |
| angular-countries-import-view-mobile | 11 | `6cb7786af1c177babf51eb605ea16c9cb5f85484c6a2a6d6ea138e39cbf67aa0` |
