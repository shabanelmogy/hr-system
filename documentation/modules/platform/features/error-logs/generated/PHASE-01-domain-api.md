<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Error Logs Phase 01 - Domain and API

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

- **Error Logs cross-platform master review:** `../modules/platform/features/error-logs/error-logs-review.md` sections 3, 4, 6
- **Error Logs API implementation profile:** `../modules/platform/features/error-logs/error-logs-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| error-logs-master | 3 | `fb41d4ee24c001854a6ee49c9c1e0a9d96d5f06876b01645b87516e286d08782` |
| error-logs-master | 4 | `b2c5336b615e80ae9ddb993d4506bda33f4d1ddd4d132280a8baf4e1cda3163a` |
| error-logs-master | 6 | `fd16df7662f5aee4c4df61b0f350e005f1c2cbdde6933cc61c30fe6287931107` |
| error-logs-api | 1 | `079dcd93c42cd7bfdf7c6af8e9bf62d872d1a2980a475ca393331b917e61ba6d` |
| error-logs-api | 2 | `d09e58043df5ec2e16f5c4ae6f7ce79fdad6569ea3086404376396571d9897e8` |
| error-logs-api | 3 | `7694ca69b5e28a04832da14a2636c65e84d83da12f6dbc8af533a9b2986d310d` |
| error-logs-api | 4 | `edb49ea04997002dc55b1b6e3279109a6f64293c22eec4f0c1d7937a4c3c1e67` |
| error-logs-api | 5 | `f087180444132eb4f1e0e667032d6a4e8617f9fd1f5de88f553953e4a3972d52` |
| error-logs-api | 6 | `4ef31b79d8208d9d72b9f00d74c160a2d3eb7c8732430e7538c5d15ab830d4d1` |
| error-logs-api | 7 | `2687eee83f53ac8560e0fc08b822c7ee66fb08e1ff631fa6a499ceb91b1123ff` |
| error-logs-api | 8 | `796b04653e5f28dd3f58cbb913eaded3782fee609b2ebc3447d104216260a8e7` |
| error-logs-api | 9 | `fd66fc91d6b3db00b806d98822d6ecfd91a3ef40afa0dc0d9e542a0e371c3301` |
| error-logs-api | 10 | `d16950140d836904e3957898dce0e346d653d0e2d56d96ead2dce8e7b8441deb` |
