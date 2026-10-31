<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Countries page-scoped charts Phase 04 - Domain Actions and Lifecycle

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

- **Countries page-scoped charts cross-platform master review:** `../modules/platform/features/angular-countries-chart-view/angular-countries-chart-view-review.md` sections 3, 4, 6, 7, 8
- **Countries page-scoped charts API implementation profile:** `../modules/platform/features/angular-countries-chart-view/angular-countries-chart-view-api.md` sections 6, 7, 8
- **Countries page-scoped charts Next.js implementation profile:** `../modules/platform/features/angular-countries-chart-view/angular-countries-chart-view-web.md` sections 6, 7, 8, 9
- **Countries page-scoped charts Expo implementation profile:** `../modules/platform/features/angular-countries-chart-view/angular-countries-chart-view-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-chart-view-master | 3 | `b2379770bcb87b06b804edb131cd8da467ae063a3b9c1b9258cfb0e62062b5e8` |
| angular-countries-chart-view-master | 4 | `b32bf19af789fada667aa96472909b6f75a6ea210b55f0581915823bbcd6bb22` |
| angular-countries-chart-view-master | 6 | `c3c684a4be97d827cab87a4bd1b10f1f359bd1eda7ae8c3bb87f16ab58d133ed` |
| angular-countries-chart-view-master | 7 | `e6ed29adc467c7b3e6533eca85693ed9f236e10628febf91a6416d902e965a5a` |
| angular-countries-chart-view-master | 8 | `e4421460076e6552298c7b3ce771b2731e8e07506acb739f5dc343dfa7c5474a` |
| angular-countries-chart-view-api | 6 | `c3c684a4be97d827cab87a4bd1b10f1f359bd1eda7ae8c3bb87f16ab58d133ed` |
| angular-countries-chart-view-api | 7 | `e6ed29adc467c7b3e6533eca85693ed9f236e10628febf91a6416d902e965a5a` |
| angular-countries-chart-view-api | 8 | `e4421460076e6552298c7b3ce771b2731e8e07506acb739f5dc343dfa7c5474a` |
| angular-countries-chart-view-web | 6 | `c3c684a4be97d827cab87a4bd1b10f1f359bd1eda7ae8c3bb87f16ab58d133ed` |
| angular-countries-chart-view-web | 7 | `e6ed29adc467c7b3e6533eca85693ed9f236e10628febf91a6416d902e965a5a` |
| angular-countries-chart-view-web | 8 | `e4421460076e6552298c7b3ce771b2731e8e07506acb739f5dc343dfa7c5474a` |
| angular-countries-chart-view-web | 9 | `c2c6110881b9ebcd29bc348dd848e4f72e74c89f2a77fb705a8868f3fadec7cc` |
| angular-countries-chart-view-mobile | 9 | `c2c6110881b9ebcd29bc348dd848e4f72e74c89f2a77fb705a8868f3fadec7cc` |
| angular-countries-chart-view-mobile | 10 | `aa7642a3fe46ec2ac105eef011a2a2040569d19e81aba4fc4da6da28bf930a4f` |
| angular-countries-chart-view-mobile | 11 | `f58f250418082bce27f4b2a8c97f814ae469be74768a9b76d13a0f342eba5a42` |
