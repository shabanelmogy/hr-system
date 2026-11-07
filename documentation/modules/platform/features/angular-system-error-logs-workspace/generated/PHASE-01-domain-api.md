<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Super Admin System Error Logs and Settings parity Phase 01 - Domain and API

## Purpose

Build the server contract first so both clients consume one stable model.

Execution reference: `documentation/guides/api/API_FEATURE_DEVELOPMENT_WORKFLOW.md`.
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

- **Super Admin System Error Logs and Settings parity cross-platform master review:** `../modules/platform/features/angular-system-error-logs-workspace/angular-system-error-logs-workspace-review.md` sections 3, 4, 6
- **Super Admin System Error Logs and Settings parity API implementation profile:** `../modules/platform/features/angular-system-error-logs-workspace/angular-system-error-logs-workspace-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-error-logs-workspace-master | 3 | `74b5b6bc297245ac52302d58ff8c4130a89c8d3879aa68d314a08fb9b18928d7` |
| angular-system-error-logs-workspace-master | 4 | `ea13c26fe451e25e2389849c6baa46db19db0e2e5818b47fcacd55b3a2281a0c` |
| angular-system-error-logs-workspace-master | 6 | `2e7929211572a0f3804eb9513fa7c0e74a249c19c2f95a606e097aec1e2521ff` |
| angular-system-error-logs-workspace-api | 1 | `27221500c9f680320394bf82abe2ef357c178b2212de64093ad06e5d7192f3bb` |
| angular-system-error-logs-workspace-api | 2 | `a749dd385b666bb616eac51f085fa68edaec20e091f7f3e14c18712f8d4d71c6` |
| angular-system-error-logs-workspace-api | 3 | `74b5b6bc297245ac52302d58ff8c4130a89c8d3879aa68d314a08fb9b18928d7` |
| angular-system-error-logs-workspace-api | 4 | `ea13c26fe451e25e2389849c6baa46db19db0e2e5818b47fcacd55b3a2281a0c` |
| angular-system-error-logs-workspace-api | 5 | `0882b5ee797d72df822b3a2c64474f56b81c240a86bc3e7e038952b3db0569c4` |
| angular-system-error-logs-workspace-api | 6 | `2e7929211572a0f3804eb9513fa7c0e74a249c19c2f95a606e097aec1e2521ff` |
| angular-system-error-logs-workspace-api | 7 | `84181d820cbe9950ec74ef69e865f89812e40ffd68eaca7532d3106cb9daf506` |
| angular-system-error-logs-workspace-api | 8 | `6f43bfd7053bfa065d6f1e2bceb15dc4556e7a92bd21fced18040a30cc8a7845` |
| angular-system-error-logs-workspace-api | 9 | `e98c2390ea74ebb9e125f9ab193cb9ee91f6be26ff2a951666083039aae33ba0` |
| angular-system-error-logs-workspace-api | 10 | `fee1dff779bd0040e0ea1567ddd715c9152f9f2552db2323caf2732ad03c6d0c` |
