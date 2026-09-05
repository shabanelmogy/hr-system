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
| fiscal-years-master | 3 | `ccc1e6d3749ac91ff4e2408e9849fe8fdf77bfac6c3c2ee91f4a20d117fb0594` |
| fiscal-years-master | 4 | `a460b43fa6abe4003f8b26786686574974837756572467bddbf56ef66c136773` |
| fiscal-years-master | 6 | `c61603f2d747c9ea9d5c5c0dbec61ba19af29c8f378afac7131e65ec8659b438` |
| fiscal-years-master | 7 | `b3750a34f63ea59165176bbfdfde4267e123c0e9eed6ed0d09b5d821c9c45099` |
| fiscal-years-master | 8 | `7bac233192642900e592d8fb97ab9c9bcadebf166ee02024e7c749ead6dc5752` |
| fiscal-years-api | 6 | `9930369dddbe839a428229fd19890e314ee7733898ea020224fbea7e78d63066` |
| fiscal-years-api | 7 | `c25d29f51a1e7ed2e7f3c4010197ff26f4c0c385fc4fb356666a1601585964fd` |
| fiscal-years-api | 8 | `048676eb30bdd218e94bb7e00f51bdf7bc4328d37eda70b842f887e50b14074c` |
| fiscal-years-web | 6 | `4a987d415b162e64422f9bb51141de6927512e52c13326d8d0f5b7718c2212ff` |
| fiscal-years-web | 7 | `40edc2f5844933853f70e51361b2d32da035cc6ee8d53c774c87de4730a707d7` |
| fiscal-years-web | 8 | `e46e54a03b71c5d25ea8647727571d4b305e67fae28e541211b08f63c0d0fa79` |
| fiscal-years-web | 9 | `7a19f6884815ed3863251e0ef30370954bdf10e1c97289a2eb0abbf324bba84a` |
| fiscal-years-mobile | 9 | `2e7fa5bc0d34196489db933bbd648c9fd6b18b04bce5f90a6b6087776daf0470` |
| fiscal-years-mobile | 10 | `30718f35722bac64dcc821190ed1fcebfcb21b3555208e9016c3e0393b10cfa1` |
| fiscal-years-mobile | 11 | `be56c4107cac3e77f8ecc76f320e8ba708f846336318127f0604261f7faa0bdc` |
