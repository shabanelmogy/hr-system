<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Managed Crystal Template Validation Phase 04 - Domain Actions and Lifecycle

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

- **Managed Crystal Template Validation cross-platform master review:** `../project/MANAGED_CRYSTAL_TEMPLATE_VALIDATION_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7, 8
- **Managed Crystal Template Validation API implementation profile:** `../api/ManagedCrystalTemplateValidation_API_Implementation_Profile.md` sections 6, 7, 8
- **Managed Crystal Template Validation Next.js implementation profile:** `../web-next/features/managed-crystal-template-validation-frontend-reference.md` sections 6, 7, 8, 9
- **Managed Crystal Template Validation Expo implementation profile:** `../mobile-react/managed-crystal-template-validation-mobile-reference.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-template-validation-master | 3 | `d5750ec782337abb998b935688fe28befe372bebda9f0fc1bdf298453539f145` |
| managed-crystal-template-validation-master | 4 | `ad565be28727a67b728477a4afa8f58cf6868f6ecd2f9bf5f7b59400f43d8141` |
| managed-crystal-template-validation-master | 6 | `fa456baddc6f73079e396b08f3b2fa608267e66d8d1d2f71036708a8182094ee` |
| managed-crystal-template-validation-master | 7 | `b512f756c88e034603039e7120d247c983a4b43461804df33719930033bff007` |
| managed-crystal-template-validation-master | 8 | `2c82cf2b421c7cc3403645c0d011e9f1fbff9375017f7f50da1692a42dd786e6` |
| managed-crystal-template-validation-api | 6 | `3654fde2d7e5594bb94be6e7371e87297b0bbddcff83ed364cd127ef3f5d7878` |
| managed-crystal-template-validation-api | 7 | `3cbe9889948792652c7be8b39a13496cb278a5eecb14326ad573f12ac9350610` |
| managed-crystal-template-validation-api | 8 | `d6a3c1c59c1b9eeaf3bc531392ef5f1b7044e855ee5825037e34c4ec110f705c` |
| managed-crystal-template-validation-web | 6 | `7a68213f82bced1cb4665df52d9fae2c966737aa820d53a2f65613be0b5d2466` |
| managed-crystal-template-validation-web | 7 | `cf847e0c84292a964edf7882d26091a1343befaf93c840b8e199b4d4c824a493` |
| managed-crystal-template-validation-web | 8 | `ecb5999ee26ee23d8b2b38c1669f4d1cc36673237994d9a061ded63e3f363bfe` |
| managed-crystal-template-validation-web | 9 | `8e50915342dff879ea7e7cd25709cd07fe46c09145f1fc0d418becf8d1f6081e` |
| managed-crystal-template-validation-mobile | 9 | `668b40e5d4249969aed1d5d9a87eff4f2dd607a7b9fbd6de8f1c96f42dc0f80e` |
| managed-crystal-template-validation-mobile | 10 | `fe5c66e936be181fca893feb23a30c2c4eb06e89ed0e90e72df4ad20df1adcc9` |
| managed-crystal-template-validation-mobile | 11 | `5672496b98a9f152da931ed1a474c686e930755ce7d91075d7d86dd0fd20b392` |
