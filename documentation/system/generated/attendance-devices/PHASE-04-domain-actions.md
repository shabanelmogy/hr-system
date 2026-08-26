<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Attendance Devices Phase 04 - Domain Actions and Lifecycle

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

- **Attendance Devices cross-platform master review:** `../project/ATTENDANCE_DEVICES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7, 8
- **Attendance Devices API implementation profile:** `../api/AttendanceDevices_API_Implementation_Profile.md` sections 6, 7, 8
- **Attendance Devices Next.js implementation profile:** `../web-next/features/attendance-devices-frontend-reference.md` sections 6, 7, 8, 9
- **Attendance Devices Expo implementation profile (deferred):** `../mobile-react/attendance-devices-mobile-reference.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| attendance-devices-master | 3 | `c6619586b58ca9eca3be36bb6d10bb72d97f3cdb67b4f49ebca55e90bc29ca5c` |
| attendance-devices-master | 4 | `883d12a168ad1f5a7d103912e0541748d3d3a692be6eea2417865a39f5e2ea18` |
| attendance-devices-master | 6 | `d4d02053ca38139b5ea51928c18352d2ad86e08b3b1308b3d3fa58fab55db761` |
| attendance-devices-master | 7 | `433b3f83669c1abbc1d39bf7fc3c8bcf8b759e1311566bfeb4e0f5c248b302ec` |
| attendance-devices-master | 8 | `8c570137ab0e423e63b23d84f9933f2c6675f723000dd948cf86cb2185fcb60a` |
| attendance-devices-api | 6 | `04b10c6fab5a3391b343a064d4d6d9d33290090eb6472769ac524cd25f50cb90` |
| attendance-devices-api | 7 | `389927ae77a95de5e5ba2a07fe29fb54e853f893118e9b1036b567b53599d34e` |
| attendance-devices-api | 8 | `f78bbaac90ebc303e057c975714f5a06e0bf81574edf89265c4893e1609e09ab` |
| attendance-devices-web | 6 | `843eda3e9357470fb982379a9542ce5755c543d373ca362e4713bf74cf51e5df` |
| attendance-devices-web | 7 | `9262a8e1389cfe8c342587a33246e1c7aef1fee0e33155a97665905bb9e04528` |
| attendance-devices-web | 8 | `e0bf7f1dade9eb1795bf7dbd1cdd0db0104d3d7cfefdcb9400756a8f3cb89f1c` |
| attendance-devices-web | 9 | `8e8732e6653ba00b4ce64dfd2b6077333fdcce1a538c184fcebe97f4d3f990cd` |
| attendance-devices-mobile | 9 | `7b8d0a6ebd857babfc8e6c9ed85367b8ae7f7a581bc4638af565ac031feecda6` |
| attendance-devices-mobile | 10 | `bb4cfc74f64a4408794dd3ea9eb58c4faa8bd828100cf90e9a6943661b9a8b31` |
| attendance-devices-mobile | 11 | `f6e3af50cabec47f4411d301618509d22c795267a86a53bd1dfdf111edba5da4` |
