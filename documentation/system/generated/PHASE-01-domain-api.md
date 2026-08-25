<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Phase 01 - Domain and API

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

- **Countries cross-platform master review:** `../project/COUNTRIES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6
- **Countries API implementation profile:** `../api/Countries_API_Implementation_Profile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| master | 3 | `395aa4699680d7fd28eccd5dcbb3d59ead3d06fee4225844efb44d7a10e11c7d` |
| master | 4 | `a9c88864fafde572fc0ffc1502f1a5ccb2fc55fdbd77aefe2c54c33d143b9529` |
| master | 6 | `b7fb453c6be690cf10f98e85664f30fb55fb590e628b0f8a0435f54cf67058ac` |
| api | 1 | `32d383dbea72903c12b0dd2d1b90c2ba6a10d6621ed91ae24f466af2563cd9c7` |
| api | 2 | `afe1864abf7934444f9ea9b8b23456c10205bf6f59cdf60460c07fd71a5a5e8c` |
| api | 3 | `1ed086d9c6342d4b59513fe93963fa4f837d0d896e5cfb9afa308ca8abebcecb` |
| api | 4 | `c5136f272c114dce53d9dd30f70a745d81a32acd0d19c8b68a6f40d8c6991eb4` |
| api | 5 | `02e43688e2b00c35e8790993ecceb3bbc3346875252da1d5f903717c53a38529` |
| api | 6 | `bd3c45a99368c9ec22533cb308e8d4e81d0bdf89dad6e2e256d47128c466d32b` |
| api | 7 | `1ab9fa036b11c40090cb0b49890916d71ab6eedaf0ee99815a641c4fcd123237` |
| api | 8 | `6ba0561bbba0e93a7ce34482ec27b468c6d56b5255c755acb11d8b29f74bb994` |
| api | 9 | `c1c6f745e49d895fa7a91d52fd3616c3c0010c46c00cd5c472f2c7e65f1791d3` |
| api | 10 | `4a41ffbc7aa486b4e9401a2ede459b9e1a905fa44b64c4fa765bc431341b8f84` |
