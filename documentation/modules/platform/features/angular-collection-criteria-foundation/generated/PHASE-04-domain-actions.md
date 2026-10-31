<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Shared collection criteria URL preparation Phase 04 - Domain Actions and Lifecycle

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

- **Shared collection criteria URL preparation cross-platform master review:** `../modules/platform/features/angular-collection-criteria-foundation/angular-collection-criteria-foundation-review.md` sections 3, 4, 6, 7, 8
- **Shared collection criteria URL preparation API implementation profile:** `../modules/platform/features/angular-collection-criteria-foundation/angular-collection-criteria-foundation-api.md` sections 6, 7, 8
- **Shared collection criteria URL preparation Next.js implementation profile:** `../modules/platform/features/angular-collection-criteria-foundation/angular-collection-criteria-foundation-web.md` sections 6, 7, 8, 9
- **Shared collection criteria URL preparation Expo implementation profile:** `../modules/platform/features/angular-collection-criteria-foundation/angular-collection-criteria-foundation-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-collection-criteria-foundation-master | 3 | `e120bae9424f50678f0c7cc941f0d8149350391eaf09474ccbc5092ac324120a` |
| angular-collection-criteria-foundation-master | 4 | `bcf2c705898c5e13f7a4b5bc6b350f2ee08fff544ba58a8525ccec6b36720864` |
| angular-collection-criteria-foundation-master | 6 | `0b2ae962f994a597a781fc41c0f929c39c5fde0d2719e1e7a5044162464bd027` |
| angular-collection-criteria-foundation-master | 7 | `1d85249d77efc9832fc5f094b4a3dd8b26add9e8fb63d4f71adb9f121d9cb791` |
| angular-collection-criteria-foundation-master | 8 | `edb03e0306a5c1288467e8473feb2d2ac2a124ea340b41fd06c98df22d02bd9c` |
| angular-collection-criteria-foundation-api | 6 | `0b2ae962f994a597a781fc41c0f929c39c5fde0d2719e1e7a5044162464bd027` |
| angular-collection-criteria-foundation-api | 7 | `1d85249d77efc9832fc5f094b4a3dd8b26add9e8fb63d4f71adb9f121d9cb791` |
| angular-collection-criteria-foundation-api | 8 | `edb03e0306a5c1288467e8473feb2d2ac2a124ea340b41fd06c98df22d02bd9c` |
| angular-collection-criteria-foundation-web | 6 | `0b2ae962f994a597a781fc41c0f929c39c5fde0d2719e1e7a5044162464bd027` |
| angular-collection-criteria-foundation-web | 7 | `1d85249d77efc9832fc5f094b4a3dd8b26add9e8fb63d4f71adb9f121d9cb791` |
| angular-collection-criteria-foundation-web | 8 | `edb03e0306a5c1288467e8473feb2d2ac2a124ea340b41fd06c98df22d02bd9c` |
| angular-collection-criteria-foundation-web | 9 | `f5dee5a7372a530fad3f09162a7ff49f3dce3d00ab98770778cd64a826e95939` |
| angular-collection-criteria-foundation-mobile | 9 | `f5dee5a7372a530fad3f09162a7ff49f3dce3d00ab98770778cd64a826e95939` |
| angular-collection-criteria-foundation-mobile | 10 | `02ba8586978267daf88bbdae9c6f80c10475256d6e6d22678381eb3524460df7` |
| angular-collection-criteria-foundation-mobile | 11 | `502b954c32abefbd0082fee8267e052b96b704dbfcaae228c6df849fae440112` |
