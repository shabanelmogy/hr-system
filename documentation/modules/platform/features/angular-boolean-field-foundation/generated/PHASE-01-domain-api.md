<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Shared boolean field preparation Phase 01 - Domain and API

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

- **Shared boolean field preparation cross-platform master review:** `../modules/platform/features/angular-boolean-field-foundation/angular-boolean-field-foundation-review.md` sections 3, 4, 6
- **Shared boolean field preparation API implementation profile:** `../modules/platform/features/angular-boolean-field-foundation/angular-boolean-field-foundation-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-boolean-field-foundation-master | 3 | `105b60ee32d8146a8c49038186ebcbcba664c350b443092de86eea58e627d6cd` |
| angular-boolean-field-foundation-master | 4 | `ae0580508cdef5d62a38c6a271bbffb458db6607d6b003aced9625a17c049670` |
| angular-boolean-field-foundation-master | 6 | `d7f6f4307682c796c94479735e56a02e4f6fccbdf46208212ffcd6a662adee54` |
| angular-boolean-field-foundation-api | 1 | `0ae423c021b74f3d4b4c4eccb231cbad9e834575b3123a543b419214a7199d4d` |
| angular-boolean-field-foundation-api | 2 | `7df39a32680faa803fac2f024cdd16a69c102b3185eb01cf3d3d437e907890ea` |
| angular-boolean-field-foundation-api | 3 | `105b60ee32d8146a8c49038186ebcbcba664c350b443092de86eea58e627d6cd` |
| angular-boolean-field-foundation-api | 4 | `ae0580508cdef5d62a38c6a271bbffb458db6607d6b003aced9625a17c049670` |
| angular-boolean-field-foundation-api | 5 | `3cd8929002b69dced37aadda0a53c2e47f73351a37ae9a936597ef2eb3798499` |
| angular-boolean-field-foundation-api | 6 | `d7f6f4307682c796c94479735e56a02e4f6fccbdf46208212ffcd6a662adee54` |
| angular-boolean-field-foundation-api | 7 | `8ecd38d30820550d928c2e3d9492bb9b2381fb8cba02032eff3bb01bbfde46e0` |
| angular-boolean-field-foundation-api | 8 | `653cc093d61e1ef12c7cebe2d2f0e0408d7c8eb7a561ba0993b8776d7a14b66b` |
| angular-boolean-field-foundation-api | 9 | `aeb73463a736e3afc44a5c8a0e4b87ec424d4cf94c519c925a73c44192ca73ed` |
| angular-boolean-field-foundation-api | 10 | `65025d0bddf1b98c587bd4cc2be53ffa24786df04ab9851b7f3666fa1c9d21d0` |
