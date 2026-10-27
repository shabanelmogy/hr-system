<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Company UI localization Phase 04 - Domain Actions and Lifecycle

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

- **Company UI localization cross-platform master review:** `../modules/platform/features/company-ui-localization/company-ui-localization-review.md` sections 3, 4, 6, 7, 8
- **Company UI localization API implementation profile:** `../modules/platform/features/company-ui-localization/company-ui-localization-api.md` sections 6, 7, 8
- **Company UI localization Next.js implementation profile:** `../modules/platform/features/company-ui-localization/company-ui-localization-web.md` sections 6, 7, 8, 9
- **Company UI localization Expo implementation profile:** `../modules/platform/features/company-ui-localization/company-ui-localization-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-ui-localization-master | 3 | `ae522a981014d3db9c430fa6065b685a3e9ea8941f671ff038f99100e42c7daf` |
| company-ui-localization-master | 4 | `4bd147662b54d98c579aed8cff606deb90ad3a173bd56299833a23743eddfbb9` |
| company-ui-localization-master | 6 | `943b732392e0c38800ae8e34732c3eba94fae4f111c24dd29ffa5bb65826cf61` |
| company-ui-localization-master | 7 | `84585fc9dd5664a9529a4b399768755ef9aae77060fa2123401f07440f5cbd7c` |
| company-ui-localization-master | 8 | `5160fa6f53e6af0ebc984c515f094804b3ceb46dae4e94867f9d3966a3f4e32a` |
| company-ui-localization-api | 6 | `bb779b766a06cc846202269f5787db5e66022d527440cc4feb10f9aa304996d9` |
| company-ui-localization-api | 7 | `7ca5a25d8744d014f3d1658bb9203c881b8304fe465919112dc969fe4b2fe247` |
| company-ui-localization-api | 8 | `a555533fd36049b26f9ec99541ffff190ce95edf577fe6e99f5864a3893ea3e1` |
| company-ui-localization-web | 6 | `9544895aff079bc536349908217a2ab1c22ecfc21b2d2bb934363d4925aed0b4` |
| company-ui-localization-web | 7 | `0fa730c51ceab1063e629cf7c3a716c5550008cf7bdf938a528f527ae1cf3624` |
| company-ui-localization-web | 8 | `78ba4e90fdd9faf3454d489beb2d3cc6a92791f1532eeaf426e432e25dc6fd83` |
| company-ui-localization-web | 9 | `2af07171624ff7ddd2246afa259f9c8ec373a1719f8561cf5e71331884df6fb1` |
| company-ui-localization-mobile | 9 | `f4ead8335fdfa8198d3e95feb4ba0654788b0b859817a3e91fd98a9540fa0706` |
| company-ui-localization-mobile | 10 | `4618cad0837107f97db6a31c332b07dc7b28cc96b8d1981871305dcd4290a853` |
| company-ui-localization-mobile | 11 | `a60d252f08206ad41a752583668c2cb3bbd03680c84ec4352a3e263e6296c6ea` |
