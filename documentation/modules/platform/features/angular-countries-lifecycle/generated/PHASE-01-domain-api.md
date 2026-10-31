<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Countries archive and restore Phase 01 - Domain and API

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

- **Countries archive and restore cross-platform master review:** `../modules/platform/features/angular-countries-lifecycle/angular-countries-lifecycle-review.md` sections 3, 4, 6
- **Countries archive and restore API implementation profile:** `../modules/platform/features/angular-countries-lifecycle/angular-countries-lifecycle-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-lifecycle-master | 3 | `2a99dc9056c58c3f8022a4321a6148bbdd7ba7a19f0dead110a8d7450cfded45` |
| angular-countries-lifecycle-master | 4 | `331e6637776a260b38003b52ffe9e21cabcf7f48d2e8ee51e8539660e2b2cb29` |
| angular-countries-lifecycle-master | 6 | `84b65d022d32811ad94d9c9aad2d0196243d75800b2f2de084df6be35b0ed3ae` |
| angular-countries-lifecycle-api | 1 | `1f1370064af30c953d980a7e69c15ba75d9088091a66b6e34fdaf78566ce6eef` |
| angular-countries-lifecycle-api | 2 | `4c7f0a13faaa13c5147c36f77a58550184056382bce2484b8842994b48755165` |
| angular-countries-lifecycle-api | 3 | `2a99dc9056c58c3f8022a4321a6148bbdd7ba7a19f0dead110a8d7450cfded45` |
| angular-countries-lifecycle-api | 4 | `331e6637776a260b38003b52ffe9e21cabcf7f48d2e8ee51e8539660e2b2cb29` |
| angular-countries-lifecycle-api | 5 | `60080ac65c3480367b6aed2361faf4a2878f724fd85c98679ed4498e919e259a` |
| angular-countries-lifecycle-api | 6 | `84b65d022d32811ad94d9c9aad2d0196243d75800b2f2de084df6be35b0ed3ae` |
| angular-countries-lifecycle-api | 7 | `f0727bca0b6c32ce6a15526681ae23f73eda6f0933f598b79a7d923d26a7d19b` |
| angular-countries-lifecycle-api | 8 | `666370365740a43f1c958be3f6068e9349259450ddceb922cbd87521a825c607` |
| angular-countries-lifecycle-api | 9 | `6c08316e9011bf4af0c9b35261ef93ed45b66954d59e93cb192ca8c5eb69b5ad` |
| angular-countries-lifecycle-api | 10 | `030e42cb4a42c82430ec2e0580076939f542a4db8345e80c239a8642c4c931e4` |
