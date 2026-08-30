<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Districts Phase 04 - Domain Actions and Lifecycle

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

- **Districts cross-platform master review:** `../project/DISTRICTS_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7, 8
- **Districts API implementation profile:** `../api/Districts_API_Implementation_Profile.md` sections 6, 7, 8
- **Districts Next.js implementation profile:** `../web-next/features/districts-frontend-reference.md` sections 6, 7, 8, 9
- **Districts Expo implementation profile:** `../mobile-react/districts-mobile-reference.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| districts-master | 3 | `5ca94ec3dcf5147246fd66770d78b4faf5c354b8b539ffdc5985965498d4b9d2` |
| districts-master | 4 | `73edb563ff159ccd70caafab0275db68887f98c3c3f22ecdfaaea7ee41b4fb2e` |
| districts-master | 6 | `bc842f66c8ecdd4133ee9a86a1901d41047bc8cc48ec01e8a302ca6ab510da07` |
| districts-master | 7 | `b4ca77c0fab6365d8f5202566b41f614348b21781231cb9bc97e4bd62aa9cd4f` |
| districts-master | 8 | `8b2d2dd81761ee08dc4f372a5fed20353b60d2020d2680d5d0138459389b7bbd` |
| districts-api | 6 | `e85e987e62cb205b6cc5a86b34fc905b3c977386331cdf9d5f931d1369c1c4cd` |
| districts-api | 7 | `2feb4c7d8f96c8dd6ba0bc7494d972c5451aa12890e991504fa31b6778814a0b` |
| districts-api | 8 | `808bf1aa73ef33b6517d65ccc0aa7d5595474cb438f80fb39f8338791b3d797e` |
| districts-web | 6 | `00dcf25c1144ba8ca5883de079af26cb60bfb6365a97577e254fd03b92bbd120` |
| districts-web | 7 | `860a8dd4899597e60282b667535463fa9f0489249c5e8ab2b5bdaac2f2a0880f` |
| districts-web | 8 | `be712da7a3d1189fdfda72359bb163b3f0693dd01c2f22edcf49b6b24526e239` |
| districts-web | 9 | `c8bdba1eea3298434fb27d599d1b0022157af7a347c461e789142ff6b60f2b88` |
| districts-mobile | 9 | `dc3c3372e64480b794fb39ffc295dd608a207d987f1ab574c7be486bd20830da` |
| districts-mobile | 10 | `34dd3fbd9e9adf72dd8ca8bfeb06bbfb6b6128192838fd704c4ee7a04d2703d7` |
| districts-mobile | 11 | `2168087827d6275ad0b45dc263ca1d342db0be761e705bdd276c7283ee141b88` |
