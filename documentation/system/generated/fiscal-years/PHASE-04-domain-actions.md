<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Fiscal Years Phase 04 - Domain Actions and Lifecycle

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

- **Fiscal Years cross-platform master review:** `../project/FISCAL_YEARS_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7, 8
- **Fiscal Years API implementation profile:** `../api/FiscalYears_API_Implementation_Profile.md` sections 6, 7, 8
- **Fiscal Years Next.js implementation profile:** `../web-next/features/fiscal-years-frontend-reference.md` sections 6, 7, 8, 9
- **Fiscal Years Expo implementation profile:** `../mobile-react/fiscal-years-mobile-reference.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| fiscal-years-master | 3 | `258121a15c42bd254f087460a281f57839ee2f56a36f373905ca0c952ed6cbe9` |
| fiscal-years-master | 4 | `ae8155eb0f3e367113ca06829c8dc5a977d40f300ab07eac4bc4c0d34b923075` |
| fiscal-years-master | 6 | `225416faf8af3c0eb0b46137e7224277e9ffe1f40b17bd0395016d24ec503d41` |
| fiscal-years-master | 7 | `e2fdfb210fe8576c90f77e555f0da8b731dfc15d2bd9a2002fcd913f4901e887` |
| fiscal-years-master | 8 | `8a884562c75bec218db6b7ce28e8ad888a66f236c8ffaa46bff5556796497dfd` |
| fiscal-years-api | 6 | `c5998a179675a1f801e330509699f991bf223f3f49c5e158934d2d886349a163` |
| fiscal-years-api | 7 | `efd0c753281b11a611dd17356e619f87e58bcbb6ab1c042cb6997a82100a7cf4` |
| fiscal-years-api | 8 | `8ab3db43e90da415c85d888ed99bee69d8defd0c62f107f2a6fed1994174ad94` |
| fiscal-years-web | 6 | `3405da07c9367a0629bce54590c20d810681262f497a67cd0d3020ab8dc3ad55` |
| fiscal-years-web | 7 | `4f6148d706881a5ebb4559e86b95ce3e51cd951f40de43f41cc7b7dd4edbcf30` |
| fiscal-years-web | 8 | `e46e54a03b71c5d25ea8647727571d4b305e67fae28e541211b08f63c0d0fa79` |
| fiscal-years-web | 9 | `6eec41f0b50bb49712d5f8fabb3b0707fdef339b21051e0a284f8c08fc99d661` |
| fiscal-years-mobile | 9 | `82f87fdc621b6e6c92dd0b85164152df8b2624fc55af606d2ab51e0c8073e475` |
| fiscal-years-mobile | 10 | `30718f35722bac64dcc821190ed1fcebfcb21b3555208e9016c3e0393b10cfa1` |
| fiscal-years-mobile | 11 | `e9554663aafac0e73cc879def0bd6a7f77caf44209e7ce53c0df2d2d9b6506b9` |
