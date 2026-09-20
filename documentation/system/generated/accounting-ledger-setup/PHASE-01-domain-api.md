<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Accounting Ledger Setup Phase 01 - Domain and API

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

- **Accounting Ledger Setup cross-platform implementation contract:** `../project/ACCOUNTING_LEDGER_SETUP_FEATURE_FULL_REVIEW.md` sections 3, 4, 6
- **Accounting Ledger Setup API implementation contract:** `../api/AccountingLedgerSetup_API_Implementation_Profile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| accounting-ledger-setup-master | 3 | `dca7efc3933fbfad21faec4412e0f5fbce8747b3881d5af2b14bb3210b1cbe45` |
| accounting-ledger-setup-master | 4 | `52db952c75365317c7bc8a2f43e41985c03640eb53c415bea2c6fcb31478eb30` |
| accounting-ledger-setup-master | 6 | `d74ddf1245aabb0329a3dfbd0a886a1fdcf078c5c3a72d290d789e6793a4d434` |
| accounting-ledger-setup-api | 1 | `c17a4b5e92cd12468b6759103ae1148006b2d9089453e32211d497d9f21ef987` |
| accounting-ledger-setup-api | 2 | `dfa1e33cba51e85e674a165bc1ec17d4fbe01faf4f5b3c2890a7287011508acf` |
| accounting-ledger-setup-api | 3 | `03ac9bbb722d71a624ddab1549476e6f6cfb431e608d35df78adc9c116a0e2b3` |
| accounting-ledger-setup-api | 4 | `4926be8482b2c7cec511e2ac9289a517a9f60f43d89c413474c145587024ae21` |
| accounting-ledger-setup-api | 5 | `66265aa17871d618f30f45705b8144dff124b15f01a9eb4c31301a39e5f874b4` |
| accounting-ledger-setup-api | 6 | `9fef499f177a2fef224c09d387e1715e008d221cfb24d257af2b814102a816b0` |
| accounting-ledger-setup-api | 7 | `a2a2e3f1cb7851f0d63e87e155617bd3c84fd60cec38021114b59dc1ff8bc4c6` |
| accounting-ledger-setup-api | 8 | `41d4b1feca011b953fd8e9854d130b9845ec2a231d006bca531ba8ee5120bcb3` |
| accounting-ledger-setup-api | 9 | `a5b5aa5aa4823181f66f2dbe86b54d78e39616d84f5fd15c7cc335601810d7fb` |
| accounting-ledger-setup-api | 10 | `64036fe6cbe6fdf951737688b0a782b317968fbbfa9fadc83066973ac550f0ef` |
