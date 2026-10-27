<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Global administration access Phase 04 - Domain Actions and Lifecycle

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

- **Global administration access cross-platform master review:** `../modules/platform/features/system-administration-access/system-administration-access-review.md` sections 3, 4, 6, 7, 8
- **Global administration access API implementation profile:** `../modules/platform/features/system-administration-access/system-administration-access-api.md` sections 6, 7, 8
- **Global administration access Next.js implementation profile:** `../modules/platform/features/system-administration-access/system-administration-access-web.md` sections 6, 7, 8, 9
- **Global administration access Expo implementation profile:** `../modules/platform/features/system-administration-access/system-administration-access-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| system-administration-access-master | 3 | `704e3c85fd755ce72131685e56fc46c41a32cbf2b8388b819b2908141a920c97` |
| system-administration-access-master | 4 | `a69c6b83cf4513c9051189de306206a99c36ab894ff3c699157a3f4d5b274268` |
| system-administration-access-master | 6 | `2629b587e5bb1b3857c3082d606a2495a68b8cd1b6519071abe158531322532e` |
| system-administration-access-master | 7 | `58cc6420bb8c825b4e6edca064742a11a6e5130811be4f92456d8f95a12d4762` |
| system-administration-access-master | 8 | `309d8d180ca02d2c3eb921de0e2f0f45b42e1431f27a5fc8df80dae139cfa537` |
| system-administration-access-api | 6 | `2629b587e5bb1b3857c3082d606a2495a68b8cd1b6519071abe158531322532e` |
| system-administration-access-api | 7 | `58cc6420bb8c825b4e6edca064742a11a6e5130811be4f92456d8f95a12d4762` |
| system-administration-access-api | 8 | `309d8d180ca02d2c3eb921de0e2f0f45b42e1431f27a5fc8df80dae139cfa537` |
| system-administration-access-web | 6 | `2629b587e5bb1b3857c3082d606a2495a68b8cd1b6519071abe158531322532e` |
| system-administration-access-web | 7 | `58cc6420bb8c825b4e6edca064742a11a6e5130811be4f92456d8f95a12d4762` |
| system-administration-access-web | 8 | `309d8d180ca02d2c3eb921de0e2f0f45b42e1431f27a5fc8df80dae139cfa537` |
| system-administration-access-web | 9 | `ae2f25e0e91b95de952ee9b9e026c0ce3a0ed25ffcfb577a03bdc77728ce85ff` |
| system-administration-access-mobile | 9 | `ae2f25e0e91b95de952ee9b9e026c0ce3a0ed25ffcfb577a03bdc77728ce85ff` |
| system-administration-access-mobile | 10 | `ebba736b456d2363c58da24a7d2cac79e48605c0f8ea29780d2f3c40f26c98a0` |
| system-administration-access-mobile | 11 | `27b43263e6a89be6211323dd828db1627d4e4b13981c9f76424aefb3e5d49a69` |
