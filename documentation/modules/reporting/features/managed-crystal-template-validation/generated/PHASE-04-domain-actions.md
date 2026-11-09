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

- **Managed Crystal Template Validation cross-platform master review:** `../modules/reporting/features/managed-crystal-template-validation/managed-crystal-template-validation-review.md` sections 3, 4, 6, 7, 8, 11, 12, 13, 14
- **Managed Crystal Template Validation API implementation profile:** `../modules/reporting/features/managed-crystal-template-validation/managed-crystal-template-validation-api.md` sections 6, 7, 8, 12, 13, 14, 15
- **Managed Crystal Template Validation Next.js implementation profile:** `../modules/reporting/features/managed-crystal-template-validation/managed-crystal-template-validation-web.md` sections 6, 7, 8, 9, 15, 16, 17, 18
- **Managed Crystal Template Validation Expo implementation profile:** `../modules/reporting/features/managed-crystal-template-validation/managed-crystal-template-validation-mobile.md` sections 9, 10, 11, 16, 17, 18, 19

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-template-validation-master | 3 | `d5750ec782337abb998b935688fe28befe372bebda9f0fc1bdf298453539f145` |
| managed-crystal-template-validation-master | 4 | `ad565be28727a67b728477a4afa8f58cf6868f6ecd2f9bf5f7b59400f43d8141` |
| managed-crystal-template-validation-master | 6 | `fa456baddc6f73079e396b08f3b2fa608267e66d8d1d2f71036708a8182094ee` |
| managed-crystal-template-validation-master | 7 | `b512f756c88e034603039e7120d247c983a4b43461804df33719930033bff007` |
| managed-crystal-template-validation-master | 8 | `2c82cf2b421c7cc3403645c0d011e9f1fbff9375017f7f50da1692a42dd786e6` |
| managed-crystal-template-validation-master | 11 | `3f41bb5a4d3db8359baeb00d8f408d1a627398ed0bb65686eb5289ae3806d272` |
| managed-crystal-template-validation-master | 12 | `f82b7aff75cf17c21b7c81eb688638474e323eb05c2bb728734c4264fba1f712` |
| managed-crystal-template-validation-master | 13 | `0fd76edfc5407361816949b20ba8a0fbfa30fcea04c0b92bb23ab9bf543e5d96` |
| managed-crystal-template-validation-master | 14 | `3359cc345f9850b9076ede98304a10f47c5a75b3b74c495267eca7eb3a5af745` |
| managed-crystal-template-validation-api | 6 | `3654fde2d7e5594bb94be6e7371e87297b0bbddcff83ed364cd127ef3f5d7878` |
| managed-crystal-template-validation-api | 7 | `3cbe9889948792652c7be8b39a13496cb278a5eecb14326ad573f12ac9350610` |
| managed-crystal-template-validation-api | 8 | `d6a3c1c59c1b9eeaf3bc531392ef5f1b7044e855ee5825037e34c4ec110f705c` |
| managed-crystal-template-validation-api | 12 | `d8b71662b09abda042effb5b5979aa6a29e6bba2fcc9f92a1998958188d44ecd` |
| managed-crystal-template-validation-api | 13 | `905afaf4256b7e50b2ff7323ae416832ae26d685997a63d32c5b67e4a13e7912` |
| managed-crystal-template-validation-api | 14 | `74e23a0061a413d4bcb719fe916892cde052ba634870c0905a5b547c9de29a32` |
| managed-crystal-template-validation-api | 15 | `e1519697d731822d251d81e5a1908ae770e0fd91b15c1413a53f01f744e3f8f3` |
| managed-crystal-template-validation-web | 6 | `7a68213f82bced1cb4665df52d9fae2c966737aa820d53a2f65613be0b5d2466` |
| managed-crystal-template-validation-web | 7 | `cf847e0c84292a964edf7882d26091a1343befaf93c840b8e199b4d4c824a493` |
| managed-crystal-template-validation-web | 8 | `ecb5999ee26ee23d8b2b38c1669f4d1cc36673237994d9a061ded63e3f363bfe` |
| managed-crystal-template-validation-web | 9 | `8e50915342dff879ea7e7cd25709cd07fe46c09145f1fc0d418becf8d1f6081e` |
| managed-crystal-template-validation-web | 15 | `71ffd06889cb60c076af3477beeb2cbd52eb6d79637070b86260a6c6a3a5b5a9` |
| managed-crystal-template-validation-web | 16 | `92f766b38be7067a49e3e4ec14ee504f576e615feca8933e6343bff2dc76222e` |
| managed-crystal-template-validation-web | 17 | `f725d9892667343198dda4470b74910f0fb9c8bf9585ca1d8f34b4e9973f7b19` |
| managed-crystal-template-validation-web | 18 | `d30321ee038a7b43bf71055131ac58359dec9b851688835e786cc0490e259d2c` |
| managed-crystal-template-validation-mobile | 9 | `668b40e5d4249969aed1d5d9a87eff4f2dd607a7b9fbd6de8f1c96f42dc0f80e` |
| managed-crystal-template-validation-mobile | 10 | `fe5c66e936be181fca893feb23a30c2c4eb06e89ed0e90e72df4ad20df1adcc9` |
| managed-crystal-template-validation-mobile | 11 | `5672496b98a9f152da931ed1a474c686e930755ce7d91075d7d86dd0fd20b392` |
| managed-crystal-template-validation-mobile | 16 | `d21f20f467817757e3187ecebcdd0a53aa5c5dc6d2880a0cd11f92ed815d6e8b` |
| managed-crystal-template-validation-mobile | 17 | `b0834738d4c76cf8d337d5d8e58445e410821856d8cdd9b374f9d9742e4e99ff` |
| managed-crystal-template-validation-mobile | 18 | `185541b1009cb128d62ed9ca6765e8577221a8470d0d65a6fe29964f23da6c30` |
| managed-crystal-template-validation-mobile | 19 | `bd5042ad1679988dc8544ec6f681a32763e3c734196095be47d633a3317eeb80` |
