<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Shared form close and discard protection preparation Phase 04 - Domain Actions and Lifecycle

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

- **Shared form close and discard protection preparation cross-platform master review:** `../modules/platform/features/angular-form-close-foundation/angular-form-close-foundation-review.md` sections 3, 4, 6, 7, 8
- **Shared form close and discard protection preparation API implementation profile:** `../modules/platform/features/angular-form-close-foundation/angular-form-close-foundation-api.md` sections 6, 7, 8
- **Shared form close and discard protection preparation Next.js implementation profile:** `../modules/platform/features/angular-form-close-foundation/angular-form-close-foundation-web.md` sections 6, 7, 8, 9
- **Shared form close and discard protection preparation Expo implementation profile:** `../modules/platform/features/angular-form-close-foundation/angular-form-close-foundation-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-form-close-foundation-master | 3 | `b6d3b49bbddbf4dab1481bed56bbcbea2646b7e3aed01ae0de50e7daff8e80c7` |
| angular-form-close-foundation-master | 4 | `5fc7d645c55b8674538b2405cbf039335f1c80730857fca4ea52a186dacb84c0` |
| angular-form-close-foundation-master | 6 | `d5fb222d29ead96431323a1755b2c748ea1335302de11d1ad14575291103f605` |
| angular-form-close-foundation-master | 7 | `0c884f06aa2e75bd9f136e9365f91561c4ef13e1f3e17a2c77e28a2700dd773f` |
| angular-form-close-foundation-master | 8 | `af092a52399af807c36db18e03a6c61f0200e7224c489154f642658fba937053` |
| angular-form-close-foundation-api | 6 | `d5fb222d29ead96431323a1755b2c748ea1335302de11d1ad14575291103f605` |
| angular-form-close-foundation-api | 7 | `0c884f06aa2e75bd9f136e9365f91561c4ef13e1f3e17a2c77e28a2700dd773f` |
| angular-form-close-foundation-api | 8 | `af092a52399af807c36db18e03a6c61f0200e7224c489154f642658fba937053` |
| angular-form-close-foundation-web | 6 | `d5fb222d29ead96431323a1755b2c748ea1335302de11d1ad14575291103f605` |
| angular-form-close-foundation-web | 7 | `0c884f06aa2e75bd9f136e9365f91561c4ef13e1f3e17a2c77e28a2700dd773f` |
| angular-form-close-foundation-web | 8 | `af092a52399af807c36db18e03a6c61f0200e7224c489154f642658fba937053` |
| angular-form-close-foundation-web | 9 | `002c5fe15f5407d5954a85ce70ef6911009c88295b1c3e9a446352e1ab1b54b3` |
| angular-form-close-foundation-mobile | 9 | `002c5fe15f5407d5954a85ce70ef6911009c88295b1c3e9a446352e1ab1b54b3` |
| angular-form-close-foundation-mobile | 10 | `64ded57526a8d16ecde8062de57ffe03d672821496b2b90463c0ad414b8c6d58` |
| angular-form-close-foundation-mobile | 11 | `010af5b5f1816905cc3eab29abd889a2eace387f4e457e73a24eae4fd88f464d` |
