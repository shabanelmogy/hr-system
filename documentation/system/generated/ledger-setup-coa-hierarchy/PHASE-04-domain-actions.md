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
| ledger-setup-coa-hierarchy-master | 3 | `492db78014ebbec06f6ea5efcb4834728e7e716f07de1a65b7a8ef54c48f5d96` |
| ledger-setup-coa-hierarchy-master | 4 | `d98c472a1497ad2d7f2e5d96839ed1a1c7fec16d3f6f3c1a45fd083f190be6d8` |
| ledger-setup-coa-hierarchy-master | 6 | `0d7dd56699efbb0a91fb1cd3b332bb99aef11aa207c01f444594a47914561f5b` |
| ledger-setup-coa-hierarchy-master | 7 | `7a06d80a788ca9f33ed3c3651f664ddddeade75ccfbc008979ae5eaf90d72150` |
| ledger-setup-coa-hierarchy-master | 8 | `f381f5b8e20edecbb259bae89a027a9c5d53f2f4681a22476941c738d69653b9` |
| ledger-setup-coa-hierarchy-api | 6 | `73e68ac89eec57a9104aabd20dae6650a50fe3d1eb96ee4e2005194dfcc3c979` |
| ledger-setup-coa-hierarchy-api | 7 | `cf04147c5bc2adca4aec42ef7c9f6cf1e6e9fa7150804c42a53d18b07ab669bd` |
| ledger-setup-coa-hierarchy-api | 8 | `8dcb5ea99081e32bbd4095112efce6a07842e0058acdc680cf894f4f04a91f47` |
| ledger-setup-coa-hierarchy-web | 6 | `4d15b00723aed36bddf556739c3720f4287becc783c84b5ee5884f074e1b716c` |
| ledger-setup-coa-hierarchy-web | 7 | `bd8a065331955528857396f8c24e7524e52af0000be228e749266b7f6baeda66` |
| ledger-setup-coa-hierarchy-web | 8 | `d1847f446370d2d37dde9fec6fb57fd8731f7c700e413476fdc3965d94a75dca` |
| ledger-setup-coa-hierarchy-web | 9 | `fe57749f97476a1c315333d34b23c33ccfb5dfda2827ab7bf16d6d2849eac083` |
| ledger-setup-coa-hierarchy-mobile | 9 | `bdaff3639647798241ca62e4075b00f97228e02a634adf5f061a4d57ad0cee53` |
| ledger-setup-coa-hierarchy-mobile | 10 | `dc9df5b0cb83c6ce8750b5bad42cfb9cb855023f0e4911db1894f6ae1b4dbe9a` |
| ledger-setup-coa-hierarchy-mobile | 11 | `caa58263a99e472c4a77664492d5fc21590c70ea93e0311cbe2c827cee848c2b` |
