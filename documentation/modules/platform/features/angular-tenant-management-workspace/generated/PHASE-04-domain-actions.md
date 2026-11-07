<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Super Admin Tenant Management parity Phase 04 - Domain Actions and Lifecycle

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

- **Super Admin Tenant Management parity cross-platform master review:** `../modules/platform/features/angular-tenant-management-workspace/angular-tenant-management-workspace-review.md` sections 3, 4, 6, 7, 8
- **Super Admin Tenant Management parity API implementation profile:** `../modules/platform/features/angular-tenant-management-workspace/angular-tenant-management-workspace-api.md` sections 6, 7, 8
- **Super Admin Tenant Management parity Next.js implementation profile:** `../modules/platform/features/angular-tenant-management-workspace/angular-tenant-management-workspace-web.md` sections 6, 7, 8, 9
- **Super Admin Tenant Management parity Expo implementation profile:** `../modules/platform/features/angular-tenant-management-workspace/angular-tenant-management-workspace-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-tenant-management-workspace-master | 3 | `bd9bee05251929ca70feb066a62a0b40cc8fe0e81164b1cb318225a9c8e4604b` |
| angular-tenant-management-workspace-master | 4 | `6f004a4d1cae47b27fae9059cf195fbdc8c3ae0cd6febda4d96530097b4e1fdf` |
| angular-tenant-management-workspace-master | 6 | `23b6612a7ccff505989ffebc4ea7e74409115e7338fdb71acda5ec577fa52b0c` |
| angular-tenant-management-workspace-master | 7 | `63ae2d8c85d4480f10772a27375b978a1e39594ff8a5363abdff26061f609192` |
| angular-tenant-management-workspace-master | 8 | `4dd2d9d16d634d5b10a07cee974304b25582a87f5f5cda75232b0a547569ea1b` |
| angular-tenant-management-workspace-api | 6 | `23b6612a7ccff505989ffebc4ea7e74409115e7338fdb71acda5ec577fa52b0c` |
| angular-tenant-management-workspace-api | 7 | `63ae2d8c85d4480f10772a27375b978a1e39594ff8a5363abdff26061f609192` |
| angular-tenant-management-workspace-api | 8 | `4dd2d9d16d634d5b10a07cee974304b25582a87f5f5cda75232b0a547569ea1b` |
| angular-tenant-management-workspace-web | 6 | `23b6612a7ccff505989ffebc4ea7e74409115e7338fdb71acda5ec577fa52b0c` |
| angular-tenant-management-workspace-web | 7 | `42e5899f727de0c183e741ea6a520ef8dce3e8cf2ad9d5414ae2260877490c65` |
| angular-tenant-management-workspace-web | 8 | `4dd2d9d16d634d5b10a07cee974304b25582a87f5f5cda75232b0a547569ea1b` |
| angular-tenant-management-workspace-web | 9 | `aea4c445078d632d1cf855287b49de312c5b558bdd3445fafec0d79842b18490` |
| angular-tenant-management-workspace-mobile | 9 | `aea4c445078d632d1cf855287b49de312c5b558bdd3445fafec0d79842b18490` |
| angular-tenant-management-workspace-mobile | 10 | `02c4d5b980a26d07c1d41aa0235b40c3775f2e3a1295ee3e632106610d4545c2` |
| angular-tenant-management-workspace-mobile | 11 | `53250fa797569e411e501724b0610d4ed1e4597f93355b69546d6d962b58cd76` |
