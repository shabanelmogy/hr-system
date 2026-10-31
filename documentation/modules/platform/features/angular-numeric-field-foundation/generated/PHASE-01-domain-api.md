<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Shared numeric field preparation Phase 01 - Domain and API

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

- **Shared numeric field preparation cross-platform master review:** `../modules/platform/features/angular-numeric-field-foundation/angular-numeric-field-foundation-review.md` sections 3, 4, 6
- **Shared numeric field preparation API implementation profile:** `../modules/platform/features/angular-numeric-field-foundation/angular-numeric-field-foundation-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-numeric-field-foundation-master | 3 | `a50c22c49537c886bb84e2789f3d24298e83a88fe2487e956e0bf5f20be556c7` |
| angular-numeric-field-foundation-master | 4 | `edd3f9b373462b8ac2e64a379419a7edef45614e218a0945bee7f04a1b1c1ff9` |
| angular-numeric-field-foundation-master | 6 | `90b3b447db8e251821cbabd42393b6d0c97cc58f0052d655106388445265d12c` |
| angular-numeric-field-foundation-api | 1 | `d9547b87dad56479ed7a9f5d16a79af3327c020dc429a43ec5b7d28c8181fd70` |
| angular-numeric-field-foundation-api | 2 | `414f2867556665bcb83f2f1ed4794d3185f8f25b5100ebaa9f80e127a10cb98b` |
| angular-numeric-field-foundation-api | 3 | `a50c22c49537c886bb84e2789f3d24298e83a88fe2487e956e0bf5f20be556c7` |
| angular-numeric-field-foundation-api | 4 | `edd3f9b373462b8ac2e64a379419a7edef45614e218a0945bee7f04a1b1c1ff9` |
| angular-numeric-field-foundation-api | 5 | `154795d81507bf30a922336b9c6d501fed92fa3a543520746a1f5b2712a86510` |
| angular-numeric-field-foundation-api | 6 | `90b3b447db8e251821cbabd42393b6d0c97cc58f0052d655106388445265d12c` |
| angular-numeric-field-foundation-api | 7 | `11121dae5fcc238d7bb7f4cc47b7e1327f9537faa434a5060adf9297b801985d` |
| angular-numeric-field-foundation-api | 8 | `cf660dea88733a16bc9c17ce4231c1fba6e5afc89865ef26e10d334ba735be9a` |
| angular-numeric-field-foundation-api | 9 | `ce837fa5be7fa391f4de61e5ec453337c57b3171ba9948aa2f36bebc0ceaf8d0` |
| angular-numeric-field-foundation-api | 10 | `0bd7827ed769528e2ab4bb6c555c68c6ba376f2c580ed0da78d2aaba1aeae03c` |
