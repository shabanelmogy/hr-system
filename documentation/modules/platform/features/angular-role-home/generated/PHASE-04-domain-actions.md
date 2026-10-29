<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Angular Role Home Phase 04 - Domain Actions and Lifecycle

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

- **Angular Role Home cross-platform master review:** `../modules/platform/features/angular-role-home/angular-role-home-review.md` sections 3, 4, 6, 7, 8
- **Angular Role Home API implementation profile:** `../modules/platform/features/angular-role-home/angular-role-home-api.md` sections 6, 7, 8
- **Angular Role Home Angular web implementation profile:** `../modules/platform/features/angular-role-home/angular-role-home-web.md` sections 6, 7, 8, 9
- **Angular Role Home Expo implementation profile:** `../modules/platform/features/angular-role-home/angular-role-home-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-role-home-master | 3 | `e048bd0ced8c61c21dd123c60b8970593fb7caec43ef695f3a15d43ce1ba450d` |
| angular-role-home-master | 4 | `0b512f0ad7afaa343b36e43ab0148064b2a42e0dd51f3d682d7de6e0570920e6` |
| angular-role-home-master | 6 | `e127c53db94b549e9a0839a46884007b0cb45407d19b1f32fe03d7fbc884e21d` |
| angular-role-home-master | 7 | `c1c548649c4b8f25bfa58b9c5e31aff3d5b9dd128868657c9f2295058e414d4d` |
| angular-role-home-master | 8 | `d28963b7a469ef83b975e057f57db47703ca3b8fd120d21ff3b4b6497b8a656f` |
| angular-role-home-api | 6 | `e127c53db94b549e9a0839a46884007b0cb45407d19b1f32fe03d7fbc884e21d` |
| angular-role-home-api | 7 | `c1c548649c4b8f25bfa58b9c5e31aff3d5b9dd128868657c9f2295058e414d4d` |
| angular-role-home-api | 8 | `d28963b7a469ef83b975e057f57db47703ca3b8fd120d21ff3b4b6497b8a656f` |
| angular-role-home-web | 6 | `e127c53db94b549e9a0839a46884007b0cb45407d19b1f32fe03d7fbc884e21d` |
| angular-role-home-web | 7 | `c1c548649c4b8f25bfa58b9c5e31aff3d5b9dd128868657c9f2295058e414d4d` |
| angular-role-home-web | 8 | `d28963b7a469ef83b975e057f57db47703ca3b8fd120d21ff3b4b6497b8a656f` |
| angular-role-home-web | 9 | `60f9c606d5d26a6f8a4c4dc82559183bcd0269bd903190817574405dbd36670f` |
| angular-role-home-mobile | 9 | `60f9c606d5d26a6f8a4c4dc82559183bcd0269bd903190817574405dbd36670f` |
| angular-role-home-mobile | 10 | `1c839c0e89ee2594c02d7b00912de2fcf2e0690ef23d50b52255e5491a33fe20` |
| angular-role-home-mobile | 11 | `091fbcbc24ef465bd0fa7e2e1b02611b0ddaca9d52a29c2deb40c8220573e104` |
