<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Super Admin System Audit Trail parity Phase 04 - Domain Actions and Lifecycle

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

- **Super Admin System Audit Trail parity cross-platform master review:** `../modules/platform/features/angular-system-audit-workspace/angular-system-audit-workspace-review.md` sections 3, 4, 6, 7, 8
- **Super Admin System Audit Trail parity API implementation profile:** `../modules/platform/features/angular-system-audit-workspace/angular-system-audit-workspace-api.md` sections 6, 7, 8
- **System Audit Trail Angular client implementation profile:** `../modules/platform/features/angular-system-audit-workspace/angular-system-audit-workspace-web.md` sections 6, 7, 8, 9
- **Super Admin System Audit Trail parity Expo implementation profile:** `../modules/platform/features/angular-system-audit-workspace/angular-system-audit-workspace-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-audit-workspace-master | 3 | `533fc06c805178a7940bd29b028ccab1aa8c03323688c0ef84db7cfe11866f11` |
| angular-system-audit-workspace-master | 4 | `0ca0921366f0d0203bf10ec88a16b5676345f89ab9076973861c17b47bda4646` |
| angular-system-audit-workspace-master | 6 | `d011d247abc657b5c966a73d18c39821472514d0caf9456b02ae0249a098165e` |
| angular-system-audit-workspace-master | 7 | `da87f59916f591acee86e14bb3dd36aeda9bfc9ea39d1d8118b370e657f93cf4` |
| angular-system-audit-workspace-master | 8 | `fe1dcbe0ed968bf0bd8847d263bcd2a32b5c1392f51e4ec8d7d72480c94d2008` |
| angular-system-audit-workspace-api | 6 | `d011d247abc657b5c966a73d18c39821472514d0caf9456b02ae0249a098165e` |
| angular-system-audit-workspace-api | 7 | `da87f59916f591acee86e14bb3dd36aeda9bfc9ea39d1d8118b370e657f93cf4` |
| angular-system-audit-workspace-api | 8 | `fe1dcbe0ed968bf0bd8847d263bcd2a32b5c1392f51e4ec8d7d72480c94d2008` |
| angular-system-audit-workspace-web | 6 | `d011d247abc657b5c966a73d18c39821472514d0caf9456b02ae0249a098165e` |
| angular-system-audit-workspace-web | 7 | `da87f59916f591acee86e14bb3dd36aeda9bfc9ea39d1d8118b370e657f93cf4` |
| angular-system-audit-workspace-web | 8 | `fe1dcbe0ed968bf0bd8847d263bcd2a32b5c1392f51e4ec8d7d72480c94d2008` |
| angular-system-audit-workspace-web | 9 | `bfe3c56110cb9e2dd3ff1d6ae28f28e836cc6795916976cc5ea125d1960c2a97` |
| angular-system-audit-workspace-mobile | 9 | `bfe3c56110cb9e2dd3ff1d6ae28f28e836cc6795916976cc5ea125d1960c2a97` |
| angular-system-audit-workspace-mobile | 10 | `7bae6bcb1db81bd9577afd59216566fa86f1eca6cc68d0bf365b9bb35af8dc96` |
| angular-system-audit-workspace-mobile | 11 | `b0f7e4802c90ae55f72ff44d21fd2e51f754f1aa25181bcdf33aa0252573c1d8` |
