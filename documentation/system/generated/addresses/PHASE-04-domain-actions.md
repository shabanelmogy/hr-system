<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Addresses Phase 04 - Domain Actions and Lifecycle

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

- **Addresses domain foundation review:** `../project/ADDRESSES_DOMAIN_FULL_REVIEW.md` sections 2, 4, 5
- **Addresses API implementation profile:** `../api/Addresses_API_Implementation_Profile.md` sections 3, 5, 6
- **Addresses Next.js integration profile:** `../web-next/features/addresses-frontend-reference.md` sections 2, 4
- **Addresses Expo integration profile:** `../mobile-react/addresses-mobile-reference.md` sections 2, 3

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| addresses-master | 2 | `f6905cf3ebdfb61f3dedafe60d90b6278bc63362788cb616cacad7e5510e93a4` |
| addresses-master | 4 | `a0fef0349c927251944fe7c45c4b516e66cdf31e740e3e873e5fb429a24fe935` |
| addresses-master | 5 | `be429c9bb75de8fc649c7097750eb74710ba53166dd392c1cfc1260915c8fd41` |
| addresses-api | 3 | `bfd1fff73dcec9a06d17661c141f21582853d046dab16d7f7ad5902273f90a98` |
| addresses-api | 5 | `fe6d8f95bb036b50e528a130b9b7aaeed873388807c4385ee5b684161f40b237` |
| addresses-api | 6 | `8ac01141e5d6cdf190b5adfc679c6ce961d165e9065e392853241b13498aa3c9` |
| addresses-web | 2 | `42ff61aee802dc6e2f1dda59633bde69d0c8d3e85cfbaecabe927b68200abbdb` |
| addresses-web | 4 | `6ab933027d6080feaeff87e1514d968c3d4fbc9f7951e69a769d52a6916abbf9` |
| addresses-mobile | 2 | `e675bb04e376c78d751a0170eed43d229dd88537467847369f7a53204bbffb00` |
| addresses-mobile | 3 | `e73acd99682385112902539081bc0398cb7dcc8b834de6a2b3f05f7e4bb67b99` |
