<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Accounting Chart of Accounts and Hierarchy Phase 04 - Domain Actions and Lifecycle

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

- **Accounting Chart of Accounts and Hierarchy cross-platform implementation contract:** `../project/LEDGER_SETUP_COA_HIERARCHY_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7, 8
- **Accounting Chart of Accounts and Hierarchy API implementation contract:** `../api/LedgerSetupCoaHierarchy_API_Implementation_Profile.md` sections 6, 7, 8
- **Accounting Chart of Accounts and Hierarchy Next.js implementation contract:** `../web-next/features/ledger-setup-coa-hierarchy-frontend-reference.md` sections 6, 7, 8, 9
- **Accounting Chart of Accounts and Hierarchy Expo implementation contract:** `../mobile-react/ledger-setup-coa-hierarchy-mobile-reference.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| ledger-setup-coa-hierarchy-master | 3 | `506261bc57d418b35b861e895202f0d0e002e76580f31b6bc221fcdf725417e3` |
| ledger-setup-coa-hierarchy-master | 4 | `d98c472a1497ad2d7f2e5d96839ed1a1c7fec16d3f6f3c1a45fd083f190be6d8` |
| ledger-setup-coa-hierarchy-master | 6 | `aa868978610f3e8a3aa72060935719cf3f657c796f10359642b45cc0c244edc5` |
| ledger-setup-coa-hierarchy-master | 7 | `289dae9e3e135bc59698fc02c8dfdbe8088e38c13624adb5c124290e507f252d` |
| ledger-setup-coa-hierarchy-master | 8 | `f381f5b8e20edecbb259bae89a027a9c5d53f2f4681a22476941c738d69653b9` |
| ledger-setup-coa-hierarchy-api | 6 | `73e68ac89eec57a9104aabd20dae6650a50fe3d1eb96ee4e2005194dfcc3c979` |
| ledger-setup-coa-hierarchy-api | 7 | `cf04147c5bc2adca4aec42ef7c9f6cf1e6e9fa7150804c42a53d18b07ab669bd` |
| ledger-setup-coa-hierarchy-api | 8 | `8dcb5ea99081e32bbd4095112efce6a07842e0058acdc680cf894f4f04a91f47` |
| ledger-setup-coa-hierarchy-web | 6 | `4d15b00723aed36bddf556739c3720f4287becc783c84b5ee5884f074e1b716c` |
| ledger-setup-coa-hierarchy-web | 7 | `bd8a065331955528857396f8c24e7524e52af0000be228e749266b7f6baeda66` |
| ledger-setup-coa-hierarchy-web | 8 | `d1847f446370d2d37dde9fec6fb57fd8731f7c700e413476fdc3965d94a75dca` |
| ledger-setup-coa-hierarchy-web | 9 | `c6b858f0d4064aa2df6f016a6629c458d4b55547c1f8febcd6fb972248133492` |
| ledger-setup-coa-hierarchy-mobile | 9 | `b41990b5ac6d76b1d2f5bab04effd08b886afb7bc93e945b2bc9dec5ae4144f8` |
| ledger-setup-coa-hierarchy-mobile | 10 | `6c0dd27cf4e3a456030fc11b4d77a976d295c3e2a999d5a91a0d21714bf8dbf0` |
| ledger-setup-coa-hierarchy-mobile | 11 | `caa58263a99e472c4a77664492d5fc21590c70ea93e0311cbe2c827cee848c2b` |
