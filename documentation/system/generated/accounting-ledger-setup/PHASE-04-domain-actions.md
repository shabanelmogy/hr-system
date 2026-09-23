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
| accounting-ledger-setup-master | 4 | `53f38a770f4b9c229d5f924b56a2be70be0db253054c0b998b0c21ec8c2ca0ca` |
| accounting-ledger-setup-master | 6 | `4c420eef9bb4f80999de2e4e4bebf23f4d9b3934746b134431e3cd97be170dbe` |
| accounting-ledger-setup-master | 7 | `d164de4b8addd9575c48cd3c43367a86fd03b0a3632109db487388e47d560bec` |
| accounting-ledger-setup-master | 8 | `5010a84fb7c0439c4063c5c9962bb97fb5bea17c52fe310a943dd589c35304bd` |
| accounting-ledger-setup-api | 6 | `d92b8334e847d6072d4b74e175d17a3445a288147d12d978a0439be0a73cb03b` |
| accounting-ledger-setup-api | 7 | `bdfa4a51832c8c7dafbb42106330d18ab2c5a6089ee4c4999f857e1e720154bd` |
| accounting-ledger-setup-api | 8 | `41d4b1feca011b953fd8e9854d130b9845ec2a231d006bca531ba8ee5120bcb3` |
| accounting-ledger-setup-web | 6 | `caa25114c13584f5c63a0d62adfe0f841af2efa070a8a061acae55ae860b3dae` |
| accounting-ledger-setup-web | 7 | `ee4dbb8fbf48ca96c8344cbd4bbf822e11232f1468c8e3f41b1a87d9a23448af` |
| accounting-ledger-setup-web | 8 | `685a2b7b584057016a5604aaabd9119f073dfe5af18c9edb020de5630782624a` |
| accounting-ledger-setup-web | 9 | `e6e40f5106ad2ec463abf8fc312ef97f5f206e1e95f8fafbe40194c72c508623` |
| accounting-ledger-setup-mobile | 9 | `b38a5d0b193d3bd41831972e1709ff0a24f68ebc99b65f78546db8f34f28775e` |
| accounting-ledger-setup-mobile | 10 | `e90120b0c01c5eb55b901a74d4dcfcb6714449cbc5290a553cbf6a83054810b2` |
| accounting-ledger-setup-mobile | 11 | `63d74a38b34eeb8328687b1a744a9507b0a7524bfbb6fb42f63c07a3a96ddd36` |
