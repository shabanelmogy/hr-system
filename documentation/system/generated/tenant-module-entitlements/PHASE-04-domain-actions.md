<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Tenant module entitlements Phase 04 - Domain Actions and Lifecycle

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

- **Tenant module entitlements cross-platform master review:** `../project/TENANT_MODULE_ENTITLEMENTS_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7, 8
- **Tenant module entitlements API implementation profile:** `../api/TenantModuleEntitlements_API_Implementation_Profile.md` sections 6, 7, 8
- **Tenant module entitlements Next.js implementation profile:** `../web-next/features/tenant-module-entitlements-frontend-reference.md` sections 6, 7, 8, 9
- **Tenant module entitlements Expo implementation profile:** `../mobile-react/tenant-module-entitlements-mobile-reference.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| tenant-module-entitlements-master | 3 | `212764afdc3ce2ce0f4bd27da0a48644dadb0f63c0edd3b9102bbabe1a727e99` |
| tenant-module-entitlements-master | 4 | `e555dc9d04feebee880d75fafd06d4fa2c525673d99cc4476055e8b15cfe36ab` |
| tenant-module-entitlements-master | 6 | `5dda69ba2342bfa1f8caee1dee1868a383b4d7c1ce1f7596a753e20c4aba1cfb` |
| tenant-module-entitlements-master | 7 | `fe1349efb104547e5f048e64174e844f17ad248fb17f5e0c7c4e14334bc8213f` |
| tenant-module-entitlements-master | 8 | `600f4185fb40b51e4d07cfc5bfb174e431721fd540d5d784cd9f15a2cddb499f` |
| tenant-module-entitlements-api | 6 | `c28dea9f9be1779904436fbc0e7db9b0303a16d90b7c6a279f165f878c551bfe` |
| tenant-module-entitlements-api | 7 | `a6814b16a6f916017847c1eee0b2a6f2a183f657f2813f888675eaaa4dbbe58a` |
| tenant-module-entitlements-api | 8 | `c37c50acf4176e243388ef9a13427e4eae964c0da2d59c75c49a3ca3f8226094` |
| tenant-module-entitlements-web | 6 | `289fdf5381d2378a18a7c79ca665ff61550aae65431d0d509fcde9aa631d3359` |
| tenant-module-entitlements-web | 7 | `aa0d7a5b27580c4af82e750a4b5d170b9e99e53c309a63f17b37fb710e2e90c0` |
| tenant-module-entitlements-web | 8 | `d4c14b4558540d754cb3e913b31c7e64094dae39e2379900ab39260604f220bf` |
| tenant-module-entitlements-web | 9 | `cfe52aebc13d17a0fff313e1a24e2e62857c9f5cdbe8683c35a8800e10dbaec5` |
| tenant-module-entitlements-mobile | 9 | `88fff12c814927904bcf16b637ce09c6d216434d475bc151c534483edd82a916` |
| tenant-module-entitlements-mobile | 10 | `0040d144a535b0dd6647f63593d6f416ce69c4da6561085b720d668765374586` |
| tenant-module-entitlements-mobile | 11 | `405a054943b4eeb6d2ab063900a2db8e31abcf04368e15f78ca3f9ce98d21f2f` |
