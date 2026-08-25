<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Address Types Phase 01 - Domain and API

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

- **Address Types cross-platform master review:** `../project/ADDRESS_TYPES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6
- **Address Types API implementation profile:** `../api/AddressTypes_API_Implementation_Profile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| address-types-master | 3 | `b36372d67e68a04bdc80577cb3924b2c827a9f79ca78cede1a5a9d3fd6eb9a17` |
| address-types-master | 4 | `7308f8020bdbc0c722447f200a173af87d8fa4f5f3fb6bf250463bd9f057ef5a` |
| address-types-master | 6 | `b36e3f0234da7c53263dc870165993e8cc3d645939e7d9b5c2d85d617ed9c5e9` |
| address-types-api | 1 | `82e817a001e64716f1c5879ea68d64a015874e25e77a86065c74f88017daee49` |
| address-types-api | 2 | `325a0fdd274fcf75cf33ea0527318607d8f9a03af6e456dfc4af0e2c569e7c2c` |
| address-types-api | 3 | `bcd99f29132d1bc904561f87c62f84127bb307981918d52179f86e32f813c9bf` |
| address-types-api | 4 | `fa3b2aaf37e4e7975ad0c3ad214ffb80cc61734289b4bf72302f4a035ff92e73` |
| address-types-api | 5 | `140dde23393ef1a59a375cb9ff8451da35be052d2a8ddd30cd36bf6d7dc370e3` |
| address-types-api | 6 | `27226d777350f5085dd3bcc6e5fbd02201f64d7a9b545c24892f5922d869fe4f` |
| address-types-api | 7 | `ff2127841a678a5f0fbb58bd3cfcf06b6e6cea807adc3c2f1f1efc059e9455d7` |
| address-types-api | 8 | `cdb4949380cc226db6ab4f53b730f5b4fd93333e08d1f8deef641ea2c1e2c358` |
| address-types-api | 9 | `1ac96c85713de2f0bed38bf50037663761a77dcc2b16886f03b0a8c0adb5a44e` |
| address-types-api | 10 | `a6b047ce552f06a101f0d842e1d2a5073f8422c48228f4a1f548e88a7a481079` |
