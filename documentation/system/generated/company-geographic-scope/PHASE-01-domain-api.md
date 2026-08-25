<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Company Geographic Scope Phase 01 - Domain and API

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

- **Company Geographic Scope cross-platform master review:** `../project/COMPANY_GEOGRAPHIC_SCOPE_FEATURE_FULL_REVIEW.md` sections 3, 4, 6
- **Company Geographic Scope API implementation profile:** `../api/CompanyGeographicScope_API_Implementation_Profile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-geographic-scope-master | 3 | `1eddc721d6657a5c21b9d719373cc2c21b1cd4c4e5da06db8520db87a76d2c77` |
| company-geographic-scope-master | 4 | `8a793aa6af268801e0554b7339d3c2a20a793da042b2ada9e9688180a6e1331b` |
| company-geographic-scope-master | 6 | `92d260cdc23463e140aee8d219007e899e8cae69c926cc42eefd62f198ac4f06` |
| company-geographic-scope-api | 1 | `70e6bbb0a933a67859b7a4c5100882a9ae324d8c8d13867b2fa97c830695db5c` |
| company-geographic-scope-api | 2 | `4e9c08b13393e9449955418a49761396d4c8155152213af650203d7f465624c9` |
| company-geographic-scope-api | 3 | `17c9f16744d3d47c1448c71cab1453c887fff297b9319616eed77258269fac29` |
| company-geographic-scope-api | 4 | `fd4a36764b8d106f6b24d5eafa14e3522133abe45dd842c6e157c3dd61afc183` |
| company-geographic-scope-api | 5 | `be0a25b6a0b38da0bdf640d835394bd958d9aa71838c671bf463625208e933ee` |
| company-geographic-scope-api | 6 | `1bd412614faadc55361e9404e5ef7bbbfa550eea95aa859f57f7823579fca834` |
| company-geographic-scope-api | 7 | `6029708d675d07c2d68b04b95cde352e14d8e33cd53477da1a1b62867bc5c2e3` |
| company-geographic-scope-api | 8 | `bfa505287d661d283b0aa02f52e340f7d6fd52b22e9dfa42ad19350143811147` |
| company-geographic-scope-api | 9 | `879c8cc480f90b5e5d6d75947b590ee079c5c9c93bce9214473adc92cecac7e5` |
| company-geographic-scope-api | 10 | `1b1990713b597c7179919e9edd107e6afd94e4fdab56d43a6ecc106196aff6c3` |
