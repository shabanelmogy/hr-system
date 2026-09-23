<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Accounting Chart of Accounts and Hierarchy Phase 01 - Domain and API

## Purpose

Build the server contract first so both clients consume one stable model.

Execution reference: `documentation/api/API_FEATURE_DEVELOPMENT_WORKFLOW.md`.
The applied feature profile supplies evidence; the workflow supplies the mandatory
existing-system review, implementation order, and Definition of Done.

## Required decisions

- Entity fields, normalized values, nullability, relationships, uniqueness, and archive semantics.
- Separate list, detail, lookup, relation, and mutation contracts where their shapes differ.
- One-based API paging, maximum page size, default status, allowed sort columns, and deterministic tie-break.
- Search field and operator allow-lists, including negative-search null behavior.
- Stable validation, not-found, conflict, in-use, and authorization responses.
- Commit order for audit, persistence, background scheduling, notification, and realtime publication.
- Legacy replacement audit: controller/DI/source consumers, tests, and persisted
  background-job type compatibility. Remove dead service paths; retain old job
  executors only for an explicit queue/history drain window with no current producer.
- Concurrency closure for every parent/child lifecycle predicate. Identify every
  mutation that can change the predicate, make all participants use one database
  transaction-lock or constraint strategy, and define deterministic multi-lock
  ordering. A check followed by `SaveChanges` without shared serialization is not
  an atomic invariant.
- When Import is Required: exact endpoint, permission, request envelope, response,
  success status, batch limit, atomicity, and idempotency. Prefer a typed JSON bulk
  envelope when the client owns file parsing; use multipart only when server-owned
  file parsing is an explicit requirement.
- When Import is Required: field-scoped and ownership-scoped duplicate rules,
  case sensitivity, parent/dependency lookup behavior, stable row or batch errors,
  and audit/notification/realtime side effects.

## Implementation order

1. Domain entity and persistence configuration.
2. Contracts, errors, mapping, and validation abstractions.
3. Read and write stores with deterministic queries.
4. CQRS queries, commands, handlers, and validators.
5. Thin versioned controller with tenant and permission requirements.
6. Dependency injection, mapping scan, localization, and persistence registration.
7. Handler, architecture, controller, and integration-focused tests.

## Exit checks

- [ ] A client can implement the feature using only documented contracts.
- [ ] Mutations commit once and schedule side effects after a successful commit.
- [ ] Parent archive versus child create/update/restore and child archive versus
      grandchild create/update/restore races are covered by the same database
      invariant boundary and focused regression evidence.
- [ ] Bulk actions state limits, duplicate-ID behavior, atomicity, and idempotency.
- [ ] A Required Import documents one exact wire example and has a controller or
      service test that asserts its request envelope and success response.
- [ ] Required Import handler/store tests cover bounds, same-field duplicates,
      relationship validation, case-only persistence conflicts, atomic failure,
      commit-before-schedule ordering, and stable errors.
- [ ] Every externally visible error has a stable code and localized message.
- [ ] No superseded service/write path remains compiled without a verified consumer
      or an explicit persisted-job compatibility reason and removal condition.
- [ ] Tests cover default paging, search, sort, status, duplicates, archive guards, restore, and bulk behavior.

## Evidence to capture

- Exact route, permission, request/response examples, status codes, and stable errors.
- Handler transaction order and the store queries that close race-sensitive rules.
- Focused validator, handler, store, controller, localization, and side-effect tests.
- Migration/index impact or an explicit no-migration decision.

## Approved references

- **Accounting Chart of Accounts and Hierarchy cross-platform implementation contract:** `../project/LEDGER_SETUP_COA_HIERARCHY_FEATURE_FULL_REVIEW.md` sections 3, 4, 6
- **Accounting Chart of Accounts and Hierarchy API implementation contract:** `../api/LedgerSetupCoaHierarchy_API_Implementation_Profile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| ledger-setup-coa-hierarchy-master | 3 | `506261bc57d418b35b861e895202f0d0e002e76580f31b6bc221fcdf725417e3` |
| ledger-setup-coa-hierarchy-master | 4 | `d98c472a1497ad2d7f2e5d96839ed1a1c7fec16d3f6f3c1a45fd083f190be6d8` |
| ledger-setup-coa-hierarchy-master | 6 | `aa868978610f3e8a3aa72060935719cf3f657c796f10359642b45cc0c244edc5` |
| ledger-setup-coa-hierarchy-api | 1 | `e2c839e0c968b6e7aa5cba8ed03dde1391d48c46c58e89f1c2110a9798469a82` |
| ledger-setup-coa-hierarchy-api | 2 | `9b18f61a2c3d53a30802a90b5245df4274e22cdd297ace37917a55854bf59a2e` |
| ledger-setup-coa-hierarchy-api | 3 | `94cf74987d2611cab49018ce2976c7821f6b85c737a97cc584454a39eae82179` |
| ledger-setup-coa-hierarchy-api | 4 | `820065d969a437a2e119ea010024d8c8644c1b5df8e05a7ccc42250bf5da133c` |
| ledger-setup-coa-hierarchy-api | 5 | `676be8796f9425327bae13950e4576b697bddafc25d70bab9d4e03f86aaca39e` |
| ledger-setup-coa-hierarchy-api | 6 | `73e68ac89eec57a9104aabd20dae6650a50fe3d1eb96ee4e2005194dfcc3c979` |
| ledger-setup-coa-hierarchy-api | 7 | `cf04147c5bc2adca4aec42ef7c9f6cf1e6e9fa7150804c42a53d18b07ab669bd` |
| ledger-setup-coa-hierarchy-api | 8 | `8dcb5ea99081e32bbd4095112efce6a07842e0058acdc680cf894f4f04a91f47` |
| ledger-setup-coa-hierarchy-api | 9 | `c8041457f1c06b0cd3ee0961ffa2e68f5affd8510f8853c775e43df1925fad8e` |
| ledger-setup-coa-hierarchy-api | 10 | `7977bfeaae288d0578f9b01da67facc08a62e49cdbee75cd43791e00b50aa0df` |
