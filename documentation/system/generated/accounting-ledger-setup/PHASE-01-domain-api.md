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
| accounting-ledger-setup-master | 4 | `53f38a770f4b9c229d5f924b56a2be70be0db253054c0b998b0c21ec8c2ca0ca` |
| accounting-ledger-setup-master | 6 | `4c420eef9bb4f80999de2e4e4bebf23f4d9b3934746b134431e3cd97be170dbe` |
| accounting-ledger-setup-api | 1 | `c17a4b5e92cd12468b6759103ae1148006b2d9089453e32211d497d9f21ef987` |
| accounting-ledger-setup-api | 2 | `1f325fb026aa8f7ef93c7130b47db404d9326dc15781005e638eda3fd735eef7` |
| accounting-ledger-setup-api | 3 | `88287551f6ed876900eabe52cd812d8ef367e50b40d219cbafdb71eca854373e` |
| accounting-ledger-setup-api | 4 | `abb770b6a3ca192bbfb70ee0ff8e378e818fa8889ce4fde4b1ae090fbce8e99e` |
| accounting-ledger-setup-api | 5 | `66265aa17871d618f30f45705b8144dff124b15f01a9eb4c31301a39e5f874b4` |
| accounting-ledger-setup-api | 6 | `d92b8334e847d6072d4b74e175d17a3445a288147d12d978a0439be0a73cb03b` |
| accounting-ledger-setup-api | 7 | `bdfa4a51832c8c7dafbb42106330d18ab2c5a6089ee4c4999f857e1e720154bd` |
| accounting-ledger-setup-api | 8 | `41d4b1feca011b953fd8e9854d130b9845ec2a231d006bca531ba8ee5120bcb3` |
| accounting-ledger-setup-api | 9 | `d29c661ae9da4a7c9386abb9bed6c06c8f0b2c2e7f6f0c5748960ee4a48d710c` |
| accounting-ledger-setup-api | 10 | `6c7e7b50ee5365b6105ecdfe2f7cb77290a4222a0ea767cae96acb5ce46021ae` |
