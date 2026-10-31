<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Foundation exit and pilot readiness assessment Phase 01 - Domain and API

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

- **Foundation exit and pilot readiness assessment cross-platform master review:** `../modules/platform/features/angular-foundation-exit-assessment/angular-foundation-exit-assessment-review.md` sections 3, 4, 6
- **Foundation exit and pilot readiness assessment API implementation profile:** `../modules/platform/features/angular-foundation-exit-assessment/angular-foundation-exit-assessment-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-foundation-exit-assessment-master | 3 | `4d3e255c72cac77b7f7bffb8b155ce832838a6c542bdc0b422902dda2c32dda4` |
| angular-foundation-exit-assessment-master | 4 | `ef1886603d2b739301c6583a472a3a32660fb656e28205f44378bd185952df7a` |
| angular-foundation-exit-assessment-master | 6 | `fbfe8ff363cfd32471333529d87cb118044ec7b76590705a0f08139b4b04006a` |
| angular-foundation-exit-assessment-api | 1 | `4579413623709aeac863bbf783f02814bc3d1481bf1c4ddae184774a52e0507a` |
| angular-foundation-exit-assessment-api | 2 | `a73ce6b46bce9f34ed00180d86d88be490d97104fa2cd668ebd21e7b405af207` |
| angular-foundation-exit-assessment-api | 3 | `4d3e255c72cac77b7f7bffb8b155ce832838a6c542bdc0b422902dda2c32dda4` |
| angular-foundation-exit-assessment-api | 4 | `ef1886603d2b739301c6583a472a3a32660fb656e28205f44378bd185952df7a` |
| angular-foundation-exit-assessment-api | 5 | `25cc0fdd99b871c548937b062151de690f320e28a2b4cb992754e45fe5dbae61` |
| angular-foundation-exit-assessment-api | 6 | `fbfe8ff363cfd32471333529d87cb118044ec7b76590705a0f08139b4b04006a` |
| angular-foundation-exit-assessment-api | 7 | `574b028cc3d8b969e4c433ba7f95e864d61fa8441914bc22adb2a275213a7fc0` |
| angular-foundation-exit-assessment-api | 8 | `a68ecda2bfe01f209cbb52e0793eaeb7d6966de6a5c17412d244ec9fdfc9f3ce` |
| angular-foundation-exit-assessment-api | 9 | `5617cac65bbfa4d8cf8a167359903eb51c4ab7ef68f1fcfc00cb268848e0c8a4` |
| angular-foundation-exit-assessment-api | 10 | `dfd965d7afe5fffcff2d3df939f8447b6070c5a7bf56d76963ec3b264ede0f5f` |
