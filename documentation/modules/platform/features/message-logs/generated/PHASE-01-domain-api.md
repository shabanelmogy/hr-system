<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Company Message Logs Phase 01 - Domain and API

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

- **Company Message Logs cross-platform master review:** `../modules/platform/features/message-logs/message-logs-review.md` sections 3, 4, 6
- **Company Message Logs API implementation profile:** `../modules/platform/features/message-logs/message-logs-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| message-logs-master | 3 | `4638d6f083a74a571f8a8252d81081c43d17d8f48eb26ee139c23e5471b85245` |
| message-logs-master | 4 | `963dd2c8e0e45d558cbecf309b2f8d2a206af2b1104a6352b9f595d8a33c64be` |
| message-logs-master | 6 | `aa21844a4a1e0b2bf19b9e53170ff8465c3fcc473af469005f07560d11f3bcdb` |
| message-logs-api | 1 | `dd2efcb3e1645a946de418bd58909c6cafad3c3cce45eb2ddc6865383c680812` |
| message-logs-api | 2 | `df9b380484c05ffc485c10789a55281de91c87e51506cb1c6c8588d6f7593df0` |
| message-logs-api | 3 | `210fb0507eb33d145321d7e0bc6163790f7e3ec78daeb5ac3c530989f09184c5` |
| message-logs-api | 4 | `bca23340d3b6afb506d2390b5a694dd266477b07ed8081024365bec0075ee140` |
| message-logs-api | 5 | `666e176deb9e9736d0eb8dedfd36c4a7e01f276b0267a88bc98274c8a6214f18` |
| message-logs-api | 6 | `f50008d41fd21005116e51e27664c29578170f427a64ef3770e2586efd068587` |
| message-logs-api | 7 | `f24b7b07cb1e4fc34608923e33487c7988033a91842aa9cdd6cbcdbea4d1dfb6` |
| message-logs-api | 8 | `982aa6893abf3c87ecf01ec98243fdcf19e92281f4271a7164b65195b4ecda50` |
| message-logs-api | 9 | `3242f39176ff7031538427a2bae25bdabdf153b9f6fe7caf9f3a5c96d1682992` |
| message-logs-api | 10 | `1cdf8f31874ed038d330d8aefd38069a233a89f69d727e89cc115081d845d75a` |
