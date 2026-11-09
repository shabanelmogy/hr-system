<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Super Admin Tenant Administrators parity Phase 04 - Domain Actions and Lifecycle

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

- **Super Admin Tenant Administrators parity cross-platform master review:** `../modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-review.md` sections 3, 4, 6, 7, 8
- **Super Admin Tenant Administrators parity API implementation profile:** `../modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-api.md` sections 6, 7, 8
- **Super Admin Tenant Administrators parity Next.js implementation profile:** `../modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-web.md` sections 6, 7, 8, 9
- **Super Admin Tenant Administrators parity Expo implementation profile:** `../modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-tenant-admins-workspace-master | 3 | `cb02ff3daf5730e7aa4f8f626540354ce6d3535dc626424c37dda120a2e7a7be` |
| angular-tenant-admins-workspace-master | 4 | `b312109aea85caea32a57fdcec24284fbf6883425ce0a13e933303f35fe09339` |
| angular-tenant-admins-workspace-master | 6 | `9d15f52db14b58a5e479be4391307c4b6c02b878731e5c7db257054d35ec6378` |
| angular-tenant-admins-workspace-master | 7 | `2c923981c40da00473fa4db151327a1323a4a1cfd247879bb0ea9b8f7815b15c` |
| angular-tenant-admins-workspace-master | 8 | `1e18636edbe60a282f77f2ab441b85f2359c9ea6051fabca7360c592e925719f` |
| angular-tenant-admins-workspace-api | 6 | `9d15f52db14b58a5e479be4391307c4b6c02b878731e5c7db257054d35ec6378` |
| angular-tenant-admins-workspace-api | 7 | `2c923981c40da00473fa4db151327a1323a4a1cfd247879bb0ea9b8f7815b15c` |
| angular-tenant-admins-workspace-api | 8 | `1e18636edbe60a282f77f2ab441b85f2359c9ea6051fabca7360c592e925719f` |
| angular-tenant-admins-workspace-web | 6 | `9d15f52db14b58a5e479be4391307c4b6c02b878731e5c7db257054d35ec6378` |
| angular-tenant-admins-workspace-web | 7 | `4ca6352bc1034a12c367821fe62724fede939f0faabee2baf4e9b4bf6d0173e9` |
| angular-tenant-admins-workspace-web | 8 | `1e18636edbe60a282f77f2ab441b85f2359c9ea6051fabca7360c592e925719f` |
| angular-tenant-admins-workspace-web | 9 | `9fc33d645ccd7ddc8a3900ab3265c732e553c5894ab8e2219f201cfe91081800` |
| angular-tenant-admins-workspace-mobile | 9 | `9fc33d645ccd7ddc8a3900ab3265c732e553c5894ab8e2219f201cfe91081800` |
| angular-tenant-admins-workspace-mobile | 10 | `9d9e0e66e19ccb5487a50d725ad157fc49323d97f3e1bc6fd76370ffb0429bb3` |
| angular-tenant-admins-workspace-mobile | 11 | `3184a5fcf173d6e35813758be2a5dac2f5597db2363e9d87eb85cd51d2da6fb3` |
