<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Countries page-scoped charts Phase 01 - Domain and API

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

- **Countries page-scoped charts cross-platform master review:** `../modules/platform/features/angular-countries-chart-view/angular-countries-chart-view-review.md` sections 3, 4, 6
- **Countries page-scoped charts API implementation profile:** `../modules/platform/features/angular-countries-chart-view/angular-countries-chart-view-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-chart-view-master | 3 | `b2379770bcb87b06b804edb131cd8da467ae063a3b9c1b9258cfb0e62062b5e8` |
| angular-countries-chart-view-master | 4 | `b32bf19af789fada667aa96472909b6f75a6ea210b55f0581915823bbcd6bb22` |
| angular-countries-chart-view-master | 6 | `c3c684a4be97d827cab87a4bd1b10f1f359bd1eda7ae8c3bb87f16ab58d133ed` |
| angular-countries-chart-view-api | 1 | `a041073a5176094e7235cfa440bae9bd49a6f3495e7877c80a95bdd408ae556f` |
| angular-countries-chart-view-api | 2 | `8dcb926bb1ab5f3d64b323d2b6a5cbe19e3d943467c74b04ab46eea8b465a232` |
| angular-countries-chart-view-api | 3 | `b2379770bcb87b06b804edb131cd8da467ae063a3b9c1b9258cfb0e62062b5e8` |
| angular-countries-chart-view-api | 4 | `b32bf19af789fada667aa96472909b6f75a6ea210b55f0581915823bbcd6bb22` |
| angular-countries-chart-view-api | 5 | `ae6d6df0f419f1dca5395a638b7a5dcbe790c0302d1b968af6a75df9fd20cadb` |
| angular-countries-chart-view-api | 6 | `c3c684a4be97d827cab87a4bd1b10f1f359bd1eda7ae8c3bb87f16ab58d133ed` |
| angular-countries-chart-view-api | 7 | `e6ed29adc467c7b3e6533eca85693ed9f236e10628febf91a6416d902e965a5a` |
| angular-countries-chart-view-api | 8 | `e4421460076e6552298c7b3ce771b2731e8e07506acb739f5dc343dfa7c5474a` |
| angular-countries-chart-view-api | 9 | `c2c6110881b9ebcd29bc348dd848e4f72e74c89f2a77fb705a8868f3fadec7cc` |
| angular-countries-chart-view-api | 10 | `aa7642a3fe46ec2ac105eef011a2a2040569d19e81aba4fc4da6da28bf930a4f` |
