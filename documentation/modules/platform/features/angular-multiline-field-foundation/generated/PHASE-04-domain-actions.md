<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Shared multiline text preparation Phase 04 - Domain Actions and Lifecycle

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

- **Shared multiline text preparation cross-platform master review:** `../modules/platform/features/angular-multiline-field-foundation/angular-multiline-field-foundation-review.md` sections 3, 4, 6, 7, 8
- **Shared multiline text preparation API implementation profile:** `../modules/platform/features/angular-multiline-field-foundation/angular-multiline-field-foundation-api.md` sections 6, 7, 8
- **Shared multiline text preparation Next.js implementation profile:** `../modules/platform/features/angular-multiline-field-foundation/angular-multiline-field-foundation-web.md` sections 6, 7, 8, 9
- **Shared multiline text preparation Expo implementation profile:** `../modules/platform/features/angular-multiline-field-foundation/angular-multiline-field-foundation-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-multiline-field-foundation-master | 3 | `1980810f355b7c804a9399c27dc399c2eac1864e54bf97eac306544f37ca482d` |
| angular-multiline-field-foundation-master | 4 | `272c8a449698331c70fc6883b437ad47aa524650b723fd00314171c84a2ac137` |
| angular-multiline-field-foundation-master | 6 | `51cf520b90ebc1b36766ed9237956fd993efb9ae57664f8acdd0256647497fc9` |
| angular-multiline-field-foundation-master | 7 | `db612ba36f16416719d93ed49b8660afab5a1259824713bfa338a822b96a6ae3` |
| angular-multiline-field-foundation-master | 8 | `a148c7cf56651c9ef62b377bd197760bbb7386b6f0fd40c1c5324e7e9fe6f4c2` |
| angular-multiline-field-foundation-api | 6 | `51cf520b90ebc1b36766ed9237956fd993efb9ae57664f8acdd0256647497fc9` |
| angular-multiline-field-foundation-api | 7 | `db612ba36f16416719d93ed49b8660afab5a1259824713bfa338a822b96a6ae3` |
| angular-multiline-field-foundation-api | 8 | `a148c7cf56651c9ef62b377bd197760bbb7386b6f0fd40c1c5324e7e9fe6f4c2` |
| angular-multiline-field-foundation-web | 6 | `51cf520b90ebc1b36766ed9237956fd993efb9ae57664f8acdd0256647497fc9` |
| angular-multiline-field-foundation-web | 7 | `db612ba36f16416719d93ed49b8660afab5a1259824713bfa338a822b96a6ae3` |
| angular-multiline-field-foundation-web | 8 | `a148c7cf56651c9ef62b377bd197760bbb7386b6f0fd40c1c5324e7e9fe6f4c2` |
| angular-multiline-field-foundation-web | 9 | `30a38aa4bc0500dd5b8495ee79bdada7874c3c8253df3f0b847d1f8862420a5f` |
| angular-multiline-field-foundation-mobile | 9 | `30a38aa4bc0500dd5b8495ee79bdada7874c3c8253df3f0b847d1f8862420a5f` |
| angular-multiline-field-foundation-mobile | 10 | `b66b763d995638f3eda95a48835de6684c52f9e16efbcf70322c0d8c6197556b` |
| angular-multiline-field-foundation-mobile | 11 | `6dd85e6c3efefb21e7a22deae56561fc17b1867f21faa8ac3d7ec3bb59eb8a73` |
