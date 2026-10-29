<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Angular Accounting Working Fiscal Year Context Phase 04 - Domain Actions and Lifecycle

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

- **Angular Accounting Working Fiscal Year Context cross-platform master review:** `../modules/platform/features/angular-fiscal-year-context/angular-fiscal-year-context-review.md` sections 3, 4, 6, 7, 8
- **Angular Accounting Working Fiscal Year Context API implementation profile:** `../modules/platform/features/angular-fiscal-year-context/angular-fiscal-year-context-api.md` sections 6, 7, 8
- **Angular Accounting Working Fiscal Year Context Angular web implementation profile:** `../modules/platform/features/angular-fiscal-year-context/angular-fiscal-year-context-web.md` sections 6, 7, 8, 9
- **Angular Accounting Working Fiscal Year Context Expo implementation profile:** `../modules/platform/features/angular-fiscal-year-context/angular-fiscal-year-context-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-fiscal-year-context-master | 3 | `78a70d62abbc68d4b52fbe7247338e9e717b0d1fa1d80b44f0bd2909137c1435` |
| angular-fiscal-year-context-master | 4 | `10cc7bacfef82781a35937d2f9c3707560c56ea7880c51cff639a1a9ed9ff201` |
| angular-fiscal-year-context-master | 6 | `635c342420a279993389ee092ec0b96324f8769c43dff3798dfc00b0c5bdcc2f` |
| angular-fiscal-year-context-master | 7 | `95aca8b7614b795b9e57bf5a8af30d7b64f01a711d06cb082e2e57d07bf7172d` |
| angular-fiscal-year-context-master | 8 | `c12e820ddc46305e7cb7da2b70ac8dd234c92fcc7a90576f50b17b92d9a53a12` |
| angular-fiscal-year-context-api | 6 | `635c342420a279993389ee092ec0b96324f8769c43dff3798dfc00b0c5bdcc2f` |
| angular-fiscal-year-context-api | 7 | `95aca8b7614b795b9e57bf5a8af30d7b64f01a711d06cb082e2e57d07bf7172d` |
| angular-fiscal-year-context-api | 8 | `c12e820ddc46305e7cb7da2b70ac8dd234c92fcc7a90576f50b17b92d9a53a12` |
| angular-fiscal-year-context-web | 6 | `635c342420a279993389ee092ec0b96324f8769c43dff3798dfc00b0c5bdcc2f` |
| angular-fiscal-year-context-web | 7 | `95aca8b7614b795b9e57bf5a8af30d7b64f01a711d06cb082e2e57d07bf7172d` |
| angular-fiscal-year-context-web | 8 | `c12e820ddc46305e7cb7da2b70ac8dd234c92fcc7a90576f50b17b92d9a53a12` |
| angular-fiscal-year-context-web | 9 | `936948f2cf78578f94106ac5f860f87c2fe4e4986e3740c23f1dc37963f132f1` |
| angular-fiscal-year-context-mobile | 9 | `936948f2cf78578f94106ac5f860f87c2fe4e4986e3740c23f1dc37963f132f1` |
| angular-fiscal-year-context-mobile | 10 | `bb2941ee2b55b076a6ff92db814d6388a469f272b33c66f16346b1c6b2fa8ead` |
| angular-fiscal-year-context-mobile | 11 | `a4f449a68c7398071ffa4f5a1ae79dac8ca0f517dddebd5d5b9db07e333ca92d` |
