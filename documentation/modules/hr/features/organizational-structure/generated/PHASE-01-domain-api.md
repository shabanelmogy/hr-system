<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Organizational Structure Phase 01 - Domain and API

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

- **Organizational Structure cross-platform master review:** `../modules/hr/features/organizational-structure/organizational-structure-review.md` sections 3, 4, 6
- **Organizational Structure API implementation profile:** `../modules/hr/features/organizational-structure/organizational-structure-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| organizational-structure-master | 3 | `57ab452f6cc671bd93de8808d8d1766d507cf902b6269bdb0e07c8422f87249a` |
| organizational-structure-master | 4 | `834005c26053eb5eee6e85e186c98953501eda8584fb9e30055ec9bd16391cb8` |
| organizational-structure-master | 6 | `3b960e2721e9df3da8e95561bbf1b7e5360891ebd8acf3c62b710b03b76021aa` |
| organizational-structure-api | 1 | `195c929b29105c0d3f89001ca362cffca04f57fe22db2790bcfe914a83bed5e5` |
| organizational-structure-api | 2 | `b4fcf221d9c895f97e3863644b7a85cfe2866a727148d5c9ea224037184574fc` |
| organizational-structure-api | 3 | `44395c8375a89c5a7b4843bd05d74f9123fa3168a5ffffb36e3cf1107cbcaf13` |
| organizational-structure-api | 4 | `f579fa4a9a8ebdfee38560d34de014604f51e8b1a4f3092c5a286362633bad89` |
| organizational-structure-api | 5 | `774d8fb4817c8ea45e9144a23fccd5fd51494424f90b31c6dcd8493803f65246` |
| organizational-structure-api | 6 | `329fee341e7ab5c423c4e623c155555d646e9de947783e8c8a2bb2d412f46a60` |
| organizational-structure-api | 7 | `e9a1bfce24a2a28512423c5054e85e1bdc1639698cad086cf1cf99e3b5d2d939` |
| organizational-structure-api | 8 | `8427fbc60b6506434f168bbb92cebc0b07e6699dec5f0c7e336d6b0c7906c32a` |
| organizational-structure-api | 9 | `ca3344c325f6847d6ebb90bdf4dad7b53c7f21be08243f517703fa79044a6a5e` |
| organizational-structure-api | 10 | `46a8a38217724b9f5f77d9a0a1907516d853b42cdf62c072da7b1c29eac2f395` |
