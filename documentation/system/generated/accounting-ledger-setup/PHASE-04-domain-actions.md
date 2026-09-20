<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Accounting Ledger Setup Phase 04 - Domain Actions and Lifecycle

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

- **Accounting Ledger Setup cross-platform implementation contract:** `../project/ACCOUNTING_LEDGER_SETUP_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7, 8
- **Accounting Ledger Setup API implementation contract:** `../api/AccountingLedgerSetup_API_Implementation_Profile.md` sections 6, 7, 8
- **Accounting Ledger Setup Next.js implementation contract:** `../web-next/features/accounting-ledger-setup-frontend-reference.md` sections 6, 7, 8, 9
- **Accounting Ledger Setup Expo implementation contract:** `../mobile-react/accounting-ledger-setup-mobile-reference.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| accounting-ledger-setup-master | 3 | `dca7efc3933fbfad21faec4412e0f5fbce8747b3881d5af2b14bb3210b1cbe45` |
| accounting-ledger-setup-master | 4 | `52db952c75365317c7bc8a2f43e41985c03640eb53c415bea2c6fcb31478eb30` |
| accounting-ledger-setup-master | 6 | `d74ddf1245aabb0329a3dfbd0a886a1fdcf078c5c3a72d290d789e6793a4d434` |
| accounting-ledger-setup-master | 7 | `530c84fc6ad3ba2299961c837d2bd3af3f2693292a7893dc1e27a7636b0c9290` |
| accounting-ledger-setup-master | 8 | `ba380ad637a7a499170084d624ed6bfda318ca5317a1ee93a61f4a625ae71187` |
| accounting-ledger-setup-api | 6 | `9fef499f177a2fef224c09d387e1715e008d221cfb24d257af2b814102a816b0` |
| accounting-ledger-setup-api | 7 | `a2a2e3f1cb7851f0d63e87e155617bd3c84fd60cec38021114b59dc1ff8bc4c6` |
| accounting-ledger-setup-api | 8 | `41d4b1feca011b953fd8e9854d130b9845ec2a231d006bca531ba8ee5120bcb3` |
| accounting-ledger-setup-web | 6 | `caa25114c13584f5c63a0d62adfe0f841af2efa070a8a061acae55ae860b3dae` |
| accounting-ledger-setup-web | 7 | `ee4dbb8fbf48ca96c8344cbd4bbf822e11232f1468c8e3f41b1a87d9a23448af` |
| accounting-ledger-setup-web | 8 | `685a2b7b584057016a5604aaabd9119f073dfe5af18c9edb020de5630782624a` |
| accounting-ledger-setup-web | 9 | `e6e40f5106ad2ec463abf8fc312ef97f5f206e1e95f8fafbe40194c72c508623` |
| accounting-ledger-setup-mobile | 9 | `b38a5d0b193d3bd41831972e1709ff0a24f68ebc99b65f78546db8f34f28775e` |
| accounting-ledger-setup-mobile | 10 | `e90120b0c01c5eb55b901a74d4dcfcb6714449cbc5290a553cbf6a83054810b2` |
| accounting-ledger-setup-mobile | 11 | `63d74a38b34eeb8328687b1a744a9507b0a7524bfbb6fb42f63c07a3a96ddd36` |
