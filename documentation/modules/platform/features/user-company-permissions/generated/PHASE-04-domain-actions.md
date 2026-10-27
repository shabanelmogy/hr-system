<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Company user permission grants Phase 04 - Domain Actions and Lifecycle

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

- **Company user permission grants cross-platform master review:** `../modules/platform/features/user-company-permissions/user-company-permissions-review.md` sections 3, 4, 6, 7, 8
- **Company user permission grants API implementation profile:** `../modules/platform/features/user-company-permissions/user-company-permissions-api.md` sections 6, 7, 8
- **Company user permission grants Next.js implementation profile:** `../modules/platform/features/user-company-permissions/user-company-permissions-web.md` sections 6, 7, 8, 9
- **Company user permission grants Expo implementation profile:** `../modules/platform/features/user-company-permissions/user-company-permissions-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| user-company-permissions-master | 3 | `756ebf92386e969f43be116106e92c0a570dadabdaf843e7672c3d772653943f` |
| user-company-permissions-master | 4 | `430044ad5b767ae3900caf16f98f07eb86dd7c7554c61c731ac605f65de84680` |
| user-company-permissions-master | 6 | `38e2c11893e8006dff70b461aaaaafcf8eb2e0aebb41a699ebd687473a153fc3` |
| user-company-permissions-master | 7 | `fc892ef575fb17921faf7c27fb0aa6f4e37f3f9991548802009cc663a1519d5e` |
| user-company-permissions-master | 8 | `82e367723ae40c48a6ebd7996337d790ed10c9e178aee51f49ce1038c4a8c896` |
| user-company-permissions-api | 6 | `38e2c11893e8006dff70b461aaaaafcf8eb2e0aebb41a699ebd687473a153fc3` |
| user-company-permissions-api | 7 | `fc892ef575fb17921faf7c27fb0aa6f4e37f3f9991548802009cc663a1519d5e` |
| user-company-permissions-api | 8 | `82e367723ae40c48a6ebd7996337d790ed10c9e178aee51f49ce1038c4a8c896` |
| user-company-permissions-web | 6 | `38e2c11893e8006dff70b461aaaaafcf8eb2e0aebb41a699ebd687473a153fc3` |
| user-company-permissions-web | 7 | `fc892ef575fb17921faf7c27fb0aa6f4e37f3f9991548802009cc663a1519d5e` |
| user-company-permissions-web | 8 | `82e367723ae40c48a6ebd7996337d790ed10c9e178aee51f49ce1038c4a8c896` |
| user-company-permissions-web | 9 | `f84749af9d320ccfd69017091157101cc8697821c62a683ab73a02dfc2e338f6` |
| user-company-permissions-mobile | 9 | `f84749af9d320ccfd69017091157101cc8697821c62a683ab73a02dfc2e338f6` |
| user-company-permissions-mobile | 10 | `04d729d73d70bbf01c5ab66c715c4e5c10064ab6fab26737d39ed6e021f55c24` |
| user-company-permissions-mobile | 11 | `47b385d6144ecc3f4dccc5eb270d800053f32d9d5f7710619626de847c0e3df4` |
