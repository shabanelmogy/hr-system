<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Shared form close and discard protection preparation Phase 01 - Domain and API

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

- **Shared form close and discard protection preparation cross-platform master review:** `../modules/platform/features/angular-form-close-foundation/angular-form-close-foundation-review.md` sections 3, 4, 6
- **Shared form close and discard protection preparation API implementation profile:** `../modules/platform/features/angular-form-close-foundation/angular-form-close-foundation-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-form-close-foundation-master | 3 | `b6d3b49bbddbf4dab1481bed56bbcbea2646b7e3aed01ae0de50e7daff8e80c7` |
| angular-form-close-foundation-master | 4 | `5fc7d645c55b8674538b2405cbf039335f1c80730857fca4ea52a186dacb84c0` |
| angular-form-close-foundation-master | 6 | `d5fb222d29ead96431323a1755b2c748ea1335302de11d1ad14575291103f605` |
| angular-form-close-foundation-api | 1 | `8f37c3f747e5d56ad0333f8861db30a5e7f82e557335bc8a8df1d8266454f67f` |
| angular-form-close-foundation-api | 2 | `4ab0b42bd0b34312c2e638a081f2d521b5b832d980c26ca738ff6c3c0421da13` |
| angular-form-close-foundation-api | 3 | `b6d3b49bbddbf4dab1481bed56bbcbea2646b7e3aed01ae0de50e7daff8e80c7` |
| angular-form-close-foundation-api | 4 | `5fc7d645c55b8674538b2405cbf039335f1c80730857fca4ea52a186dacb84c0` |
| angular-form-close-foundation-api | 5 | `9ff921df4fc4987bf8c7a0eeb12c2ad7d91105c91a00c35f6240c4efe1ebfdcc` |
| angular-form-close-foundation-api | 6 | `d5fb222d29ead96431323a1755b2c748ea1335302de11d1ad14575291103f605` |
| angular-form-close-foundation-api | 7 | `0c884f06aa2e75bd9f136e9365f91561c4ef13e1f3e17a2c77e28a2700dd773f` |
| angular-form-close-foundation-api | 8 | `af092a52399af807c36db18e03a6c61f0200e7224c489154f642658fba937053` |
| angular-form-close-foundation-api | 9 | `002c5fe15f5407d5954a85ce70ef6911009c88295b1c3e9a446352e1ab1b54b3` |
| angular-form-close-foundation-api | 10 | `64ded57526a8d16ecde8062de57ffe03d672821496b2b90463c0ad414b8c6d58` |
