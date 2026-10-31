<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Angular shared reference selection foundation Phase 01 - Domain and API

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

- **Angular shared reference selection foundation cross-platform master review:** `../modules/platform/features/angular-reference-selection-foundation/angular-reference-selection-foundation-review.md` sections 3, 4, 6
- **Angular shared reference selection foundation API implementation profile:** `../modules/platform/features/angular-reference-selection-foundation/angular-reference-selection-foundation-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-reference-selection-foundation-master | 3 | `89001f0f82ef697025a5065360e679728b8a9a66d431f15041a7c4a82b663fea` |
| angular-reference-selection-foundation-master | 4 | `298f39e8f9b7fd7822edce0f1349b6c89c18b2c702901c2255a8e0a25282b9f2` |
| angular-reference-selection-foundation-master | 6 | `f23c5727ad7a87ce9eed57a1ed99d3d6c842ba51ae556b0be17649845c404a16` |
| angular-reference-selection-foundation-api | 1 | `1ecd36f0f84fb8e830c2e7fdca7b2a8edfc3d311b1e55f70ea5ea5bf585539b5` |
| angular-reference-selection-foundation-api | 2 | `537611928d4ad534cb9ca0e397c9acbcf72e233ccfdbb56417fa922dd41c63c4` |
| angular-reference-selection-foundation-api | 3 | `89001f0f82ef697025a5065360e679728b8a9a66d431f15041a7c4a82b663fea` |
| angular-reference-selection-foundation-api | 4 | `298f39e8f9b7fd7822edce0f1349b6c89c18b2c702901c2255a8e0a25282b9f2` |
| angular-reference-selection-foundation-api | 5 | `e7255f0794a2b4f0a3e64af0a6d7b202cd9bc75cc83b4e612decfd22facb43d9` |
| angular-reference-selection-foundation-api | 6 | `f23c5727ad7a87ce9eed57a1ed99d3d6c842ba51ae556b0be17649845c404a16` |
| angular-reference-selection-foundation-api | 7 | `f302fc3abbe2c2596bc26d7c93965dd5d36a9f9c85e13b2fd843ae9674b49465` |
| angular-reference-selection-foundation-api | 8 | `6a2b5a31d342ee7f4b5d95bf35cb98c65de7e9bc88c0218f080411461abbbeba` |
| angular-reference-selection-foundation-api | 9 | `e0cae5b9f75bda3965fbb2f4a7484fc6fe1da3799a7f9cd5b990b855b5c7216b` |
| angular-reference-selection-foundation-api | 10 | `3dc1fc0618d3a5213ece8855cc506bb6a802c6f5b514953ce804fdc8e569ab93` |
