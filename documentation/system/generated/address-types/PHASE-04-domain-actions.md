<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Address Types Phase 04 - Domain Actions and Lifecycle

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

- **Address Types cross-platform master review:** `../project/ADDRESS_TYPES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7, 8
- **Address Types API implementation profile:** `../api/AddressTypes_API_Implementation_Profile.md` sections 6, 7, 8
- **Address Types Next.js implementation profile:** `../web-next/features/address-types-frontend-reference.md` sections 6, 7, 8, 9
- **Address Types Expo implementation profile:** `../mobile-react/address-types-mobile-reference.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| address-types-master | 3 | `7df320a1cdbe421b7edf28e7bb0ed7c4ad026ba0d76af15dbb1ff27080f10f13` |
| address-types-master | 4 | `7308f8020bdbc0c722447f200a173af87d8fa4f5f3fb6bf250463bd9f057ef5a` |
| address-types-master | 6 | `b36e3f0234da7c53263dc870165993e8cc3d645939e7d9b5c2d85d617ed9c5e9` |
| address-types-master | 7 | `78e6057906c656526f8fb427486cc0fcf24d5fd8fb865fdb58d0a786b9cce3ba` |
| address-types-master | 8 | `d644b335ee5a2463885136b0a10c31dc4dd5af695866e6a2bbb825356a29fcfa` |
| address-types-api | 6 | `547661ad62c069b0422d4ab8cd62d05730aee097aa745593612a67912ca82030` |
| address-types-api | 7 | `ff2127841a678a5f0fbb58bd3cfcf06b6e6cea807adc3c2f1f1efc059e9455d7` |
| address-types-api | 8 | `cdb4949380cc226db6ab4f53b730f5b4fd93333e08d1f8deef641ea2c1e2c358` |
| address-types-web | 6 | `e31de5b161673fd29780835b82d2cabdad7aa5dfd0b8d35b981ccfeb1a468836` |
| address-types-web | 7 | `fc67d7de0f0a34d6d50f7f0d8871c5114b873ca7abf672816e3273ffc1f8a2a8` |
| address-types-web | 8 | `9105872832cbff57378bc222233612b39548d236abe7f34bb04952991ac33862` |
| address-types-web | 9 | `78b529dec2a9aeea35eec3b2e8cd6963b1bcc4b1959f92e7911ae3eb75591bb1` |
| address-types-mobile | 9 | `1eb3eeeb4af6f72d4dc6b92406f29f8886c3b7d535241bdedf64b9fb3a2faa57` |
| address-types-mobile | 10 | `be75a56fd912809ad9b5f8182a667a56fde2a1fabef7ac4db5eb3046e994e6cf` |
| address-types-mobile | 11 | `6728484eaad5c096796aba4b1c30c8e72109a355c1b087d00688e38426f88e98` |
