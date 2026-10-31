<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Complete shared PrimeNG Table capabilities Phase 01 - Domain and API

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

- **Complete shared PrimeNG Table capabilities cross-platform master review:** `../modules/platform/features/angular-grid-capabilities/angular-grid-capabilities-review.md` sections 3, 4, 6
- **Complete shared PrimeNG Table capabilities API implementation profile:** `../modules/platform/features/angular-grid-capabilities/angular-grid-capabilities-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-grid-capabilities-master | 3 | `5a2ce7d223a49e94cc59cfde9889cc25cfa4c0aacbd21d7920fc2ba41e005af7` |
| angular-grid-capabilities-master | 4 | `04a49d8f05ff7846a82b8487639c09b8b3d4a1fefd25bd89f94e13497629268f` |
| angular-grid-capabilities-master | 6 | `dfcf9a6a661c765951ed8291e2d008a301fc7ffe081796f0ff0a8039eb11d9ef` |
| angular-grid-capabilities-api | 1 | `f79cdcbdb88f39547cdb85ed96fb7e5509a4787d0720962d402601f5da4fc8ee` |
| angular-grid-capabilities-api | 2 | `69ef1b7a3274521368a20c0d398fd2b62edf04537bac39cee66099cccbac9eb6` |
| angular-grid-capabilities-api | 3 | `5a2ce7d223a49e94cc59cfde9889cc25cfa4c0aacbd21d7920fc2ba41e005af7` |
| angular-grid-capabilities-api | 4 | `04a49d8f05ff7846a82b8487639c09b8b3d4a1fefd25bd89f94e13497629268f` |
| angular-grid-capabilities-api | 5 | `3472f547a2548a8a7dc7cf1a9793c19fe2af31f527680c4bf79cddde0fe01e8a` |
| angular-grid-capabilities-api | 6 | `dfcf9a6a661c765951ed8291e2d008a301fc7ffe081796f0ff0a8039eb11d9ef` |
| angular-grid-capabilities-api | 7 | `8cf28db5889c5e4cdbaf893c3bc712b096c49a27df338bc71a4a2744ccd5def6` |
| angular-grid-capabilities-api | 8 | `1a88531afb53989d42a83368fed092db8cdb99fbb3802aad2dcee8d02f9c023a` |
| angular-grid-capabilities-api | 9 | `a1489c8330bd0c141667b8f5fa1740f2a3633e7102ab4687734ec2bf7725f178` |
| angular-grid-capabilities-api | 10 | `c0b63473188ac0d8bdf814240acb1887e8ec1b3b0b2a7ab8775bc40215b23d09` |
