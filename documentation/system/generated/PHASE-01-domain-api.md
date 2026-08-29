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
| master | 3 | `8514635d9b88b4e74c315a3f0b0860314393524012944996853cce1ab76195cd` |
| master | 4 | `640408799d07c9939468c39e65e9d2601daa6e89d7896f24b13a924f4ecbb04d` |
| master | 6 | `b7fb453c6be690cf10f98e85664f30fb55fb590e628b0f8a0435f54cf67058ac` |
| api | 1 | `32d383dbea72903c12b0dd2d1b90c2ba6a10d6621ed91ae24f466af2563cd9c7` |
| api | 2 | `70e242510100008b25d44a8a5d2a54a4500f059da1bbce5d5b3fd16f34828ff0` |
| api | 3 | `1ed086d9c6342d4b59513fe93963fa4f837d0d896e5cfb9afa308ca8abebcecb` |
| api | 4 | `c5136f272c114dce53d9dd30f70a745d81a32acd0d19c8b68a6f40d8c6991eb4` |
| api | 5 | `02e43688e2b00c35e8790993ecceb3bbc3346875252da1d5f903717c53a38529` |
| api | 6 | `7a0068ac357a0f11efb5c80b77a0c24ccac4f86c4c981f24d6916fe168dd16a8` |
| api | 7 | `d3c803b44c4e65794a60c9b31eeeab120922dc55a8da5e8c0de7e8a116913f93` |
| api | 8 | `6ba0561bbba0e93a7ce34482ec27b468c6d56b5255c755acb11d8b29f74bb994` |
| api | 9 | `c1c6f745e49d895fa7a91d52fd3616c3c0010c46c00cd5c472f2c7e65f1791d3` |
| api | 10 | `4a41ffbc7aa486b4e9401a2ede459b9e1a905fa44b64c4fa765bc431341b8f84` |
