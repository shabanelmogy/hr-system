<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Angular API contract generation compatibility proof Phase 01 - Domain and API

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

- **Angular API contract generation compatibility proof cross-platform master review:** `../modules/platform/features/angular-api-contract-generation-proof/angular-api-contract-generation-proof-review.md` sections 3, 4, 6
- **Angular API contract generation compatibility proof API implementation profile:** `../modules/platform/features/angular-api-contract-generation-proof/angular-api-contract-generation-proof-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-api-contract-generation-proof-master | 3 | `e315e31fc7b1aaeefa3db25c33d5acd3c3ace47d3fa8d611e04f0b744706fada` |
| angular-api-contract-generation-proof-master | 4 | `4ebed5f2b84b04bec2ea90dd08aa6fd428d9534cfc8ad1276b8ce46da124c4fc` |
| angular-api-contract-generation-proof-master | 6 | `b41e2c1eb859488b6ed13dca4845ef329fe82644f1c7c230f10482e4e863f650` |
| angular-api-contract-generation-proof-api | 1 | `05a1c635c46a3eb0792ec73846b7b313dce0ca8097d044fb38c678d39c1eb44c` |
| angular-api-contract-generation-proof-api | 2 | `4175488691af7b51b1d42a1ee43d8077207c2229d6575324f6ef899e2d6c3501` |
| angular-api-contract-generation-proof-api | 3 | `e315e31fc7b1aaeefa3db25c33d5acd3c3ace47d3fa8d611e04f0b744706fada` |
| angular-api-contract-generation-proof-api | 4 | `4ebed5f2b84b04bec2ea90dd08aa6fd428d9534cfc8ad1276b8ce46da124c4fc` |
| angular-api-contract-generation-proof-api | 5 | `49afe2bb4db3fac02f1d86edf857f1f97125d58e1c256407a86f861ded5c87e7` |
| angular-api-contract-generation-proof-api | 6 | `b41e2c1eb859488b6ed13dca4845ef329fe82644f1c7c230f10482e4e863f650` |
| angular-api-contract-generation-proof-api | 7 | `56aba998ce7ccc78088ecbbcc5605381bfe63186119ea63a85a2b6e20ca68c32` |
| angular-api-contract-generation-proof-api | 8 | `fd292d3cec432f44bb98aceb506aa1d3f871da0aed1f145d4b1ce14bcd82c541` |
| angular-api-contract-generation-proof-api | 9 | `78ce449fad32387d28b10ac190a7b24314efa780388f75ebc4f3cd34c045783e` |
| angular-api-contract-generation-proof-api | 10 | `90e4bcdbf79b13aab5307175b41a047870abb2e21b858362cb7abed7fb17ffab` |
