<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Angular application context navigation Phase 01 - Domain and API

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

- **Angular application context navigation cross-platform master review:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-review.md` sections 3, 4, 6
- **Angular application context navigation API implementation profile:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-module-context-navigation-master | 3 | `b360497f8f7a980a9b2e158a0a14f5452ed6bdbf7c98891fa791064460ae6390` |
| angular-module-context-navigation-master | 4 | `c1324c1cfb273d7ea9912b07e2c2e2eb5826afac16b1e3439e4c10d30ed5a0a0` |
| angular-module-context-navigation-master | 6 | `8ec030f4e1c72aa5c699512260c1c57d68ebd7688d2b02e3013500dd8f961336` |
| angular-module-context-navigation-api | 1 | `c55738e67daf516bad24d330b5eaa48d89aa771aa0c5c9367dde7a00cf1a6302` |
| angular-module-context-navigation-api | 2 | `cd0441cf47d901383bbcd3f66cd55e25b22eca84f14b433a4c4e5a4136a775b5` |
| angular-module-context-navigation-api | 3 | `b360497f8f7a980a9b2e158a0a14f5452ed6bdbf7c98891fa791064460ae6390` |
| angular-module-context-navigation-api | 4 | `c1324c1cfb273d7ea9912b07e2c2e2eb5826afac16b1e3439e4c10d30ed5a0a0` |
| angular-module-context-navigation-api | 5 | `ad37f9208578207bb142bb810412eea23caf874669fcc873c8cfd31d088c353d` |
| angular-module-context-navigation-api | 6 | `8ec030f4e1c72aa5c699512260c1c57d68ebd7688d2b02e3013500dd8f961336` |
| angular-module-context-navigation-api | 7 | `121cd35d3780b240c74f440e3f368fc2c3e388ea0b602cfe9595e04f66aa23ea` |
| angular-module-context-navigation-api | 8 | `8fe455f912589c8225049720348791a1b3f36a0bbb64fd18640fe27e425f1726` |
| angular-module-context-navigation-api | 9 | `5c8b535c12fcf226da0d043061e2fe30da081036abe32c27e1862428f2f872a9` |
| angular-module-context-navigation-api | 10 | `dddfcf4db65993beab3a319f9abebb699878f3620d64ea3cab5d74456652b3e5` |
