<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Organizational Structure Phase 01 - Domain and API

## Purpose

Build the server contract first so both clients consume one stable model.

Execution reference: `documentation/api/Feature_Module_Implementation_Checklist.md`.
The applied feature profile supplies evidence; the generic checklist supplies the
implementation discipline.

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

- **Organizational Structure cross-platform master review:** `../project/ORGANIZATIONAL_STRUCTURE_FEATURE_FULL_REVIEW.md` sections 3, 4, 6
- **Organizational Structure API implementation profile:** `../api/OrganizationalStructure_API_Implementation_Profile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| organizational-structure-master | 3 | `7752fcae21fe02783537e6b8887668c9875709af3a5629f05ddee9dca78de403` |
| organizational-structure-master | 4 | `0beaf7376a09bb7c622523a47042700f05bf8105485ff4f3fda6be4ed287136a` |
| organizational-structure-master | 6 | `2fdee62992580c5d76fc63348edf52701b1e514b1c18ff8be30c53dda4d1b0bf` |
| organizational-structure-api | 1 | `b8c989473a06ddbe6a84a443aaac33642b06ab953cb22b6c2f51f1ce60e2adaf` |
| organizational-structure-api | 2 | `27a7d756ca282d4db9b1ab92e5b5df45479c9f85baf87951fcdf7a45b808d95a` |
| organizational-structure-api | 3 | `974d6b6bf0aacb6deedf8d8fd873688c9b63a23ccd029e65c9ce5a3bf19837ff` |
| organizational-structure-api | 4 | `20cdb676a33f799a7159dd0022486bbdac6600fd2379d7345facbff042394365` |
| organizational-structure-api | 5 | `774d8fb4817c8ea45e9144a23fccd5fd51494424f90b31c6dcd8493803f65246` |
| organizational-structure-api | 6 | `329fee341e7ab5c423c4e623c155555d646e9de947783e8c8a2bb2d412f46a60` |
| organizational-structure-api | 7 | `e9a1bfce24a2a28512423c5054e85e1bdc1639698cad086cf1cf99e3b5d2d939` |
| organizational-structure-api | 8 | `8427fbc60b6506434f168bbb92cebc0b07e6699dec5f0c7e336d6b0c7906c32a` |
| organizational-structure-api | 9 | `bb97abd860546e88987447fc83aeaa058d22e9fc11562226223c3952b5391913` |
| organizational-structure-api | 10 | `691c8be03efd3ce06ac8b599b24b3736ef9b3f74d8da99e0a19cbe28d593839f` |
