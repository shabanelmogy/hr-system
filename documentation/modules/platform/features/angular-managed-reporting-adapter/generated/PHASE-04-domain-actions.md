<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Managed reporting adapter preparation Phase 04 - Domain Actions and Lifecycle

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

- **Managed reporting adapter preparation cross-platform master review:** `../modules/platform/features/angular-managed-reporting-adapter/angular-managed-reporting-adapter-review.md` sections 3, 4, 6, 7, 8
- **Managed reporting adapter preparation API implementation profile:** `../modules/platform/features/angular-managed-reporting-adapter/angular-managed-reporting-adapter-api.md` sections 6, 7, 8
- **Managed reporting adapter preparation Next.js implementation profile:** `../modules/platform/features/angular-managed-reporting-adapter/angular-managed-reporting-adapter-web.md` sections 6, 7, 8, 9
- **Managed reporting adapter preparation Expo implementation profile:** `../modules/platform/features/angular-managed-reporting-adapter/angular-managed-reporting-adapter-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-managed-reporting-adapter-master | 3 | `0a8d888ba28cd7d35ccaaf15d92162d047c48a3482e973322396688b5d08e520` |
| angular-managed-reporting-adapter-master | 4 | `0d75a0cc98ed3a106e8343d19526c34b38a8aa4ce019633d33510a6df070b725` |
| angular-managed-reporting-adapter-master | 6 | `7ddf91640d39b54272167893efb83e1111050dce8b98d44d9b1a94e99b53523f` |
| angular-managed-reporting-adapter-master | 7 | `6cef15e087ca9135e2e920cff1c04ee79be87ad22f23806e486bd03344b31515` |
| angular-managed-reporting-adapter-master | 8 | `ccd65bd62ffc69968dd25b5533dce7903889333438951fd55ff4f1fcf34a15a4` |
| angular-managed-reporting-adapter-api | 6 | `7ddf91640d39b54272167893efb83e1111050dce8b98d44d9b1a94e99b53523f` |
| angular-managed-reporting-adapter-api | 7 | `6cef15e087ca9135e2e920cff1c04ee79be87ad22f23806e486bd03344b31515` |
| angular-managed-reporting-adapter-api | 8 | `ccd65bd62ffc69968dd25b5533dce7903889333438951fd55ff4f1fcf34a15a4` |
| angular-managed-reporting-adapter-web | 6 | `7ddf91640d39b54272167893efb83e1111050dce8b98d44d9b1a94e99b53523f` |
| angular-managed-reporting-adapter-web | 7 | `6cef15e087ca9135e2e920cff1c04ee79be87ad22f23806e486bd03344b31515` |
| angular-managed-reporting-adapter-web | 8 | `ccd65bd62ffc69968dd25b5533dce7903889333438951fd55ff4f1fcf34a15a4` |
| angular-managed-reporting-adapter-web | 9 | `134f6c9e94fe56442f0bda990b5c3b4f33cdaf72115b8973b40c9ebec4fc79fa` |
| angular-managed-reporting-adapter-mobile | 9 | `134f6c9e94fe56442f0bda990b5c3b4f33cdaf72115b8973b40c9ebec4fc79fa` |
| angular-managed-reporting-adapter-mobile | 10 | `36f180ef4c51ad92659ec0c8848c07e2636ccbb9bb6c3b1f12d982b41b09d353` |
| angular-managed-reporting-adapter-mobile | 11 | `93a24091f3b77bb5313d74a69e82a8bf121d35d9a343c8278f1ff6ba6c4715ad` |
