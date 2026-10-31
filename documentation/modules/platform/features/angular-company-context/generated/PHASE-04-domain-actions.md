<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Angular Company Context Phase 04 - Domain Actions and Lifecycle

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

- **Angular Company Context cross-platform master review:** `../modules/platform/features/angular-company-context/angular-company-context-review.md` sections 3, 4, 6, 7, 8
- **Angular Company Context API implementation profile:** `../modules/platform/features/angular-company-context/angular-company-context-api.md` sections 6, 7, 8
- **Angular Company Context Angular web implementation profile:** `../modules/platform/features/angular-company-context/angular-company-context-web.md` sections 6, 7, 8, 9
- **Angular Company Context Expo implementation profile:** `../modules/platform/features/angular-company-context/angular-company-context-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-company-context-master | 3 | `de45d458f6bea39cbce3f586b3d58ba78942d26311965ecbe210bdb9917fae90` |
| angular-company-context-master | 4 | `33ac2b68366190503fea644fa25ab07f6f4db8bac30ec031b362cd61c25770a3` |
| angular-company-context-master | 6 | `d358079c04f995e0f06a80047c596457bf688c2606c38afa5af000425e8d7324` |
| angular-company-context-master | 7 | `a6989eff1f1c1a31c97de9a9493237f71b0976d722153e3061380c57c221d6f6` |
| angular-company-context-master | 8 | `834ac0a66a13b464cf0ec1dcde0d92abbe02ed2eeb9ac63a7b438ba6203fd389` |
| angular-company-context-api | 6 | `d358079c04f995e0f06a80047c596457bf688c2606c38afa5af000425e8d7324` |
| angular-company-context-api | 7 | `a6989eff1f1c1a31c97de9a9493237f71b0976d722153e3061380c57c221d6f6` |
| angular-company-context-api | 8 | `834ac0a66a13b464cf0ec1dcde0d92abbe02ed2eeb9ac63a7b438ba6203fd389` |
| angular-company-context-web | 6 | `d358079c04f995e0f06a80047c596457bf688c2606c38afa5af000425e8d7324` |
| angular-company-context-web | 7 | `a6989eff1f1c1a31c97de9a9493237f71b0976d722153e3061380c57c221d6f6` |
| angular-company-context-web | 8 | `834ac0a66a13b464cf0ec1dcde0d92abbe02ed2eeb9ac63a7b438ba6203fd389` |
| angular-company-context-web | 9 | `d132938c99a9616bfa53df535c2a6fd45aff5a6ad81fa0d6f3f921758a806f08` |
| angular-company-context-mobile | 9 | `d132938c99a9616bfa53df535c2a6fd45aff5a6ad81fa0d6f3f921758a806f08` |
| angular-company-context-mobile | 10 | `2dc6d4c18f56599e8f391bb6e5b7e07352be81e8ebeb0028b9e0917e3cb86c4e` |
| angular-company-context-mobile | 11 | `1143b113c8297b174b9d634a216df28433520c46a609679ab3f798c7c9c6a9ad` |
