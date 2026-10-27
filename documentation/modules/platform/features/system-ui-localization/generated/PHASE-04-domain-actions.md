<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Authorized global UI texts Phase 04 - Domain Actions and Lifecycle

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

- **Authorized global UI texts cross-platform master review:** `../modules/platform/features/system-ui-localization/system-ui-localization-review.md` sections 3, 4, 6, 7, 8
- **Authorized global UI texts API implementation profile:** `../modules/platform/features/system-ui-localization/system-ui-localization-api.md` sections 6, 7, 8
- **Authorized global UI texts Next.js implementation profile:** `../modules/platform/features/system-ui-localization/system-ui-localization-web.md` sections 6, 7, 8, 9
- **Authorized global UI texts Expo implementation profile:** `../modules/platform/features/system-ui-localization/system-ui-localization-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| system-ui-localization-master | 3 | `1ee7d4e8885245528fdf4f6bec8d6924401c91d12afe634f6e608126037ffcb7` |
| system-ui-localization-master | 4 | `70e996ad943b48a5390a7c4448bec7db1c3245527c19f1bd2e3b4f9ae8f265aa` |
| system-ui-localization-master | 6 | `3bbcb625fb4c308266540a9c24a749a31aaff91d5e1d10ba69d1773f6abcc50a` |
| system-ui-localization-master | 7 | `a8ab3f527bc433b0074537902f6277738ca193373b87064641cebcd110862d9a` |
| system-ui-localization-master | 8 | `ab04613f8900e50c021f17ece5784bbd9ff2c8ec0a5ab19e1fa0707c1e8a7437` |
| system-ui-localization-api | 6 | `3bbcb625fb4c308266540a9c24a749a31aaff91d5e1d10ba69d1773f6abcc50a` |
| system-ui-localization-api | 7 | `a8ab3f527bc433b0074537902f6277738ca193373b87064641cebcd110862d9a` |
| system-ui-localization-api | 8 | `ab04613f8900e50c021f17ece5784bbd9ff2c8ec0a5ab19e1fa0707c1e8a7437` |
| system-ui-localization-web | 6 | `3bbcb625fb4c308266540a9c24a749a31aaff91d5e1d10ba69d1773f6abcc50a` |
| system-ui-localization-web | 7 | `a8ab3f527bc433b0074537902f6277738ca193373b87064641cebcd110862d9a` |
| system-ui-localization-web | 8 | `ab04613f8900e50c021f17ece5784bbd9ff2c8ec0a5ab19e1fa0707c1e8a7437` |
| system-ui-localization-web | 9 | `b2bb6b54de02f61156ea76e042b7ec1efd6dff331c3a384ecfe59732d9aa0ae9` |
| system-ui-localization-mobile | 9 | `b2bb6b54de02f61156ea76e042b7ec1efd6dff331c3a384ecfe59732d9aa0ae9` |
| system-ui-localization-mobile | 10 | `70d00273093757d7ab7466ed0d5ae7e30edafed482e6361c972641ff640741f0` |
| system-ui-localization-mobile | 11 | `7071778ae3aeee3acdf7c4f79c16425f5f3a9b502205a302b7fbc6ba254c3793` |
