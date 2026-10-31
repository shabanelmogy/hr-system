<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Countries create and edit workflow Phase 04 - Domain Actions and Lifecycle

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

- **Countries create and edit workflow cross-platform master review:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-review.md` sections 3, 4, 6, 7, 8
- **Countries create and edit workflow API implementation profile:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-api.md` sections 6, 7, 8
- **Countries create and edit workflow Next.js implementation profile:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-web.md` sections 6, 7, 8, 9
- **Countries create and edit workflow Expo implementation profile:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-edit-workflow-master | 3 | `db3a081602bb5973134e4ce07713f62205089a3eb34649c6e76848d34e252309` |
| angular-countries-edit-workflow-master | 4 | `191dd68f7e834b4f6033d137a3fa9e59fd2a4ca303758d4fbe493e9159690254` |
| angular-countries-edit-workflow-master | 6 | `181613fc61072107ad666952c73167e3fa398b359d944f7e58d217082463aca3` |
| angular-countries-edit-workflow-master | 7 | `75fe6c506ec73b0cbe3140da9c7cd32ad63a48d247ab8865c78c76e10961c1bf` |
| angular-countries-edit-workflow-master | 8 | `ff276aa95fc18c307c2643d7f5b234fd8cc7b61a7a3028ff07d0e9d8ed3a9710` |
| angular-countries-edit-workflow-api | 6 | `181613fc61072107ad666952c73167e3fa398b359d944f7e58d217082463aca3` |
| angular-countries-edit-workflow-api | 7 | `75fe6c506ec73b0cbe3140da9c7cd32ad63a48d247ab8865c78c76e10961c1bf` |
| angular-countries-edit-workflow-api | 8 | `ff276aa95fc18c307c2643d7f5b234fd8cc7b61a7a3028ff07d0e9d8ed3a9710` |
| angular-countries-edit-workflow-web | 6 | `181613fc61072107ad666952c73167e3fa398b359d944f7e58d217082463aca3` |
| angular-countries-edit-workflow-web | 7 | `75fe6c506ec73b0cbe3140da9c7cd32ad63a48d247ab8865c78c76e10961c1bf` |
| angular-countries-edit-workflow-web | 8 | `ff276aa95fc18c307c2643d7f5b234fd8cc7b61a7a3028ff07d0e9d8ed3a9710` |
| angular-countries-edit-workflow-web | 9 | `b55df01be12c2ea1f2e5a24818e4fa75a7f9a9d56308f87afe33f278801d5e3f` |
| angular-countries-edit-workflow-mobile | 9 | `b55df01be12c2ea1f2e5a24818e4fa75a7f9a9d56308f87afe33f278801d5e3f` |
| angular-countries-edit-workflow-mobile | 10 | `564a8021c73eace16eb080013f1642aeaa13633e4c3a21f7121220904a608d2a` |
| angular-countries-edit-workflow-mobile | 11 | `adda81dee42224b01bc2856c4f6282a4e94dd40fce4d5c5c636539fb544f459a` |
