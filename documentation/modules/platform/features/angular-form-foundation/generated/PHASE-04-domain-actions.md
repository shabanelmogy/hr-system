<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Angular Shared Text Fields and Form Submission Phase 04 - Domain Actions and Lifecycle

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

- **Angular Shared Text Fields and Form Submission cross-platform master review:** `../modules/platform/features/angular-form-foundation/angular-form-foundation-review.md` sections 3, 4, 6, 7, 8
- **Angular Shared Text Fields and Form Submission API implementation profile:** `../modules/platform/features/angular-form-foundation/angular-form-foundation-api.md` sections 6, 7, 8
- **Angular Shared Text Fields and Form Submission Next.js implementation profile:** `../modules/platform/features/angular-form-foundation/angular-form-foundation-web.md` sections 6, 7, 8, 9
- **Angular Shared Text Fields and Form Submission Expo implementation profile:** `../modules/platform/features/angular-form-foundation/angular-form-foundation-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-form-foundation-master | 3 | `1c07ac405eb9a9da732bbc2cd5d3043d903b7d7fee12ac491660742dcf928262` |
| angular-form-foundation-master | 4 | `1b47dfc85b7c0c905a5cfc0e75f64cdc37b04cf1e47a64acd27ba7fb18fe99c9` |
| angular-form-foundation-master | 6 | `4c846e1af1e4f8be32a79a58ff2f272759a316890b776c9960c0096a4661669a` |
| angular-form-foundation-master | 7 | `e46cfce5be74e89543f3d8ad5ef40f3640578392f7f72abee376d81c0041bcf8` |
| angular-form-foundation-master | 8 | `8e9a6c65ec70640c0b36054bd0f77faedfee71f12d1eb28d45398ddfb7365b67` |
| angular-form-foundation-api | 6 | `4c846e1af1e4f8be32a79a58ff2f272759a316890b776c9960c0096a4661669a` |
| angular-form-foundation-api | 7 | `8991a19064c7d81739fba17e6500f19e98224091570403ef290e474d8988ec4e` |
| angular-form-foundation-api | 8 | `8e9a6c65ec70640c0b36054bd0f77faedfee71f12d1eb28d45398ddfb7365b67` |
| angular-form-foundation-web | 6 | `4c846e1af1e4f8be32a79a58ff2f272759a316890b776c9960c0096a4661669a` |
| angular-form-foundation-web | 7 | `e46cfce5be74e89543f3d8ad5ef40f3640578392f7f72abee376d81c0041bcf8` |
| angular-form-foundation-web | 8 | `8e9a6c65ec70640c0b36054bd0f77faedfee71f12d1eb28d45398ddfb7365b67` |
| angular-form-foundation-web | 9 | `9e69e079b4dcc5b2ca68cde1376645625bb85e1030a5da4e8083eb9453d322ee` |
| angular-form-foundation-mobile | 9 | `9e69e079b4dcc5b2ca68cde1376645625bb85e1030a5da4e8083eb9453d322ee` |
| angular-form-foundation-mobile | 10 | `7cef5c81383b73aa3f407c82f8fbd0dd848ef5b67a6e2f0eb8adfb995ec8d14c` |
| angular-form-foundation-mobile | 11 | `391d65f6b02080f8b4bacf2293b5a07a1aa69f834d784a1d94b4bb86400ee81c` |
