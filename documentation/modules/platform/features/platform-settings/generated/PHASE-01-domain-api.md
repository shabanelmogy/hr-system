<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Platform Settings Phase 01 - Domain and API

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

- **Platform Settings cross-platform master review:** `../modules/platform/features/platform-settings/platform-settings-review.md` sections 3, 4, 6
- **Platform Settings API implementation profile:** `../modules/platform/features/platform-settings/platform-settings-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| platform-settings-master | 3 | `62db90956ab6487883efb3c81f5ef78e05f291c3128abba4724d1d8ee3263e86` |
| platform-settings-master | 4 | `1e6e30d327293c1ef34116ee5580e98d7b008fe943f3ebb221db1c5c4df40ea0` |
| platform-settings-master | 6 | `561a04d004f55425502034332d421de9b0ac65843d053222311168511572cd1f` |
| platform-settings-api | 1 | `e7cf42bc512ac24ee8f5ee3dc9f777f895f8bde639a1c3c6c89f8afb047daba0` |
| platform-settings-api | 2 | `7664248c1e5affd7398416d5ad1ab49d52d3b081544918b3b624c46687e96408` |
| platform-settings-api | 3 | `5e01aa0834e5ccbc1d5f815211cfced03da63e35420c3c9352ca035f8f1b53b1` |
| platform-settings-api | 4 | `ff2b5f78fd2c0a5d1f7e968cd97045485cd48e0b361dc8f8e92185b26548d428` |
| platform-settings-api | 5 | `73c0c6fcd063c2fa77ab3915c547b728ae55ef5ee83bf7f545f605d6bea567ed` |
| platform-settings-api | 6 | `dbac0d62cb0b83825b86b158c13101cc7970cb631a6bbcdb9fbb4d01ef265121` |
| platform-settings-api | 7 | `e6bab648b8bd6dce24eb8630b58eac9e88a079b96c661cbbf447d9847f07ce82` |
| platform-settings-api | 8 | `b4b85b84dd4a6eb867090d3024f1aeac578479a819de55d47917502a6f02034e` |
| platform-settings-api | 9 | `705267b53d0736f6c557f2b10985d7ad6dabcfe01cba7ec61074506ced42856f` |
| platform-settings-api | 10 | `b8d7735a0908620b69365d6a702eb28f9dfc25f1784676ef7668c14b98eb47aa` |
