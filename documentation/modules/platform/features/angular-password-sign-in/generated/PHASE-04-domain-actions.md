<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Angular Password Sign-in and Session Entry Phase 04 - Domain Actions and Lifecycle

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

- **Angular Password Sign-in and Session Entry cross-platform master review:** `../modules/platform/features/angular-password-sign-in/angular-password-sign-in-review.md` sections 3, 4, 6, 7, 8
- **Angular Password Sign-in and Session Entry API implementation profile:** `../modules/platform/features/angular-password-sign-in/angular-password-sign-in-api.md` sections 6, 7, 8
- **Angular Password Sign-in and Session Entry Next.js implementation profile:** `../modules/platform/features/angular-password-sign-in/angular-password-sign-in-web.md` sections 6, 7, 8, 9
- **Angular Password Sign-in and Session Entry Expo implementation profile:** `../modules/platform/features/angular-password-sign-in/angular-password-sign-in-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-password-sign-in-master | 3 | `d5e936d54807668736382545378507c26cca64348e0b3da20e4c67577ffbbddd` |
| angular-password-sign-in-master | 4 | `d06b04062d6c005d2e30e19b963b1a4ce012c21c495812ea6ecba8ce076468e7` |
| angular-password-sign-in-master | 6 | `0e3a09ab847df948a96ac927449465c464811f6340cf891e2ae5a8ff7a770f89` |
| angular-password-sign-in-master | 7 | `e4f6797163f888606842779e37f5fd483d649ff93504447be1234913e9563c6d` |
| angular-password-sign-in-master | 8 | `20bb0006bf41335f8388d59ee615c62130b86c47d6054816da5b6ffffcd1ef4f` |
| angular-password-sign-in-api | 6 | `0e3a09ab847df948a96ac927449465c464811f6340cf891e2ae5a8ff7a770f89` |
| angular-password-sign-in-api | 7 | `e4f6797163f888606842779e37f5fd483d649ff93504447be1234913e9563c6d` |
| angular-password-sign-in-api | 8 | `20bb0006bf41335f8388d59ee615c62130b86c47d6054816da5b6ffffcd1ef4f` |
| angular-password-sign-in-web | 6 | `0e3a09ab847df948a96ac927449465c464811f6340cf891e2ae5a8ff7a770f89` |
| angular-password-sign-in-web | 7 | `e4f6797163f888606842779e37f5fd483d649ff93504447be1234913e9563c6d` |
| angular-password-sign-in-web | 8 | `20bb0006bf41335f8388d59ee615c62130b86c47d6054816da5b6ffffcd1ef4f` |
| angular-password-sign-in-web | 9 | `1c4d78b720a7cdf945b7660d390d8dc8231cdb31b67d5839949dd89d27c6741e` |
| angular-password-sign-in-mobile | 9 | `1c4d78b720a7cdf945b7660d390d8dc8231cdb31b67d5839949dd89d27c6741e` |
| angular-password-sign-in-mobile | 10 | `ca3239d03a84ac7440b0a9d7d9bb7a9b26160ab88f976e7084951110f8210966` |
| angular-password-sign-in-mobile | 11 | `f29eb371e5fdf8dd9fa760be380d9fc7883aa336f094a45c0809293be5ea1032` |
