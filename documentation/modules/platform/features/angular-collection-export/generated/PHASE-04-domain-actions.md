<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Shared all-filtered Excel and CSV export Phase 04 - Domain Actions and Lifecycle

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

- **Shared all-filtered Excel and CSV export cross-platform master review:** `../modules/platform/features/angular-collection-export/angular-collection-export-review.md` sections 3, 4, 6, 7, 8
- **Shared all-filtered Excel and CSV export API implementation profile:** `../modules/platform/features/angular-collection-export/angular-collection-export-api.md` sections 6, 7, 8
- **Shared all-filtered Excel and CSV export Next.js implementation profile:** `../modules/platform/features/angular-collection-export/angular-collection-export-web.md` sections 6, 7, 8, 9
- **Shared all-filtered Excel and CSV export Expo implementation profile:** `../modules/platform/features/angular-collection-export/angular-collection-export-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-collection-export-master | 3 | `445de2c62628a394c0c4ec636f2ab80c9d6bf0fdfa161141d186a179838d80fa` |
| angular-collection-export-master | 4 | `11ab4fd40aa5c27d030d22f24d84c6ba4aa8773f59f94187bbfe01cad619991c` |
| angular-collection-export-master | 6 | `a261439a7e54afa223514c4b4c8a291ad970e428010bdf50cccb9644f45a9743` |
| angular-collection-export-master | 7 | `22a4d8edb5b7c12c4ef24386083a68460c545b2812f26a0b4b84929c92765310` |
| angular-collection-export-master | 8 | `2bd7cae6c908f53e4d96af362446cc66c27886f0a5c931fff2193898b3c39b30` |
| angular-collection-export-api | 6 | `a261439a7e54afa223514c4b4c8a291ad970e428010bdf50cccb9644f45a9743` |
| angular-collection-export-api | 7 | `22a4d8edb5b7c12c4ef24386083a68460c545b2812f26a0b4b84929c92765310` |
| angular-collection-export-api | 8 | `2bd7cae6c908f53e4d96af362446cc66c27886f0a5c931fff2193898b3c39b30` |
| angular-collection-export-web | 6 | `a261439a7e54afa223514c4b4c8a291ad970e428010bdf50cccb9644f45a9743` |
| angular-collection-export-web | 7 | `22a4d8edb5b7c12c4ef24386083a68460c545b2812f26a0b4b84929c92765310` |
| angular-collection-export-web | 8 | `2bd7cae6c908f53e4d96af362446cc66c27886f0a5c931fff2193898b3c39b30` |
| angular-collection-export-web | 9 | `0314d42449a9d815704ec1cae9e1b9a83cdc2fd19c9822997852028d23c15113` |
| angular-collection-export-mobile | 9 | `0314d42449a9d815704ec1cae9e1b9a83cdc2fd19c9822997852028d23c15113` |
| angular-collection-export-mobile | 10 | `d1edf745c381758e648f1843d464426c2fdbb943b90ae1d70f8e0c2e7583ac2d` |
| angular-collection-export-mobile | 11 | `be1f78514e46607c9b87c07d2f3512c055e814008c906d57690f5c96bbc11a4a` |
