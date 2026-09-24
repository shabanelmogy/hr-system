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
| fiscal-years-master | 3 | `8390cefc7a311be46bc6e92580fcbe7aff06ff47aaa4ac187f90cd7e66903da8` |
| fiscal-years-master | 4 | `e2521b85856f5b6c1e6f32e24792ae592df4134bee4bdcc4000751481eedce7e` |
| fiscal-years-master | 6 | `e03953b3fea34d231ad9a922ae587bd21b59920251d27e5d5b70cfc570a01fc8` |
| fiscal-years-master | 7 | `e48e4b393af65084e67296aba09a61bfefd8c5ca257478e14ddb0845a243296e` |
| fiscal-years-master | 8 | `0608539faf50906c65ce836f3ec4d3ac23ed071fee40e136df580a996f2a1c73` |
| fiscal-years-api | 6 | `748acbb8a884f50f81cdf9e854ef7f784765a8f2781f904bf2a90f5872ed6c64` |
| fiscal-years-api | 7 | `bb9330bdbdb4a33564e6b4560a0a2709d55cca905f26b079bd9507f9bb0276ad` |
| fiscal-years-api | 8 | `da26f9374d1461299ddd9043d1a72414d6f63e7df4cd8babe579a9c9382cebb2` |
| fiscal-years-web | 6 | `4a987d415b162e64422f9bb51141de6927512e52c13326d8d0f5b7718c2212ff` |
| fiscal-years-web | 7 | `40edc2f5844933853f70e51361b2d32da035cc6ee8d53c774c87de4730a707d7` |
| fiscal-years-web | 8 | `e46e54a03b71c5d25ea8647727571d4b305e67fae28e541211b08f63c0d0fa79` |
| fiscal-years-web | 9 | `79fbad010860a07f76192e693aa5e688ad95ffb364f8c207add350a15e041676` |
| fiscal-years-mobile | 9 | `82f87fdc621b6e6c92dd0b85164152df8b2624fc55af606d2ab51e0c8073e475` |
| fiscal-years-mobile | 10 | `30718f35722bac64dcc821190ed1fcebfcb21b3555208e9016c3e0393b10cfa1` |
| fiscal-years-mobile | 11 | `52260959e8e4915eb5304aceea135dd4715ff6ff3ded05dacbd3e6be022fab0c` |
