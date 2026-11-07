<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# System Error Logs managed reports Phase 01 - Domain and API

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

- **System Error Logs managed reports cross-platform master review:** `../modules/platform/features/angular-system-error-log-reports/angular-system-error-log-reports-review.md` sections 3, 4, 6
- **System Error Logs managed reports API implementation profile:** `../modules/platform/features/angular-system-error-log-reports/angular-system-error-log-reports-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-error-log-reports-master | 3 | `af5eaaef486626fff1d4354733e65c1a9458f5ef9609f6286761ecb451b0998c` |
| angular-system-error-log-reports-master | 4 | `dae0a8847e44166632877639f7e93fc1a1262ee7002bda5355bcd1760d2c3a68` |
| angular-system-error-log-reports-master | 6 | `df0dc6ec5bd68ab7fc21c09cee491973d00caacc2610c7aac7123a97cb31fd70` |
| angular-system-error-log-reports-api | 1 | `f7cd7664118897df3aaa7c45aeea2ed29157b85da2bb5f846db5b5ff413aa3bc` |
| angular-system-error-log-reports-api | 2 | `acb734f7fe636701495dc27f6aefd8f51be19fad48557bb58dc1bb66567cc219` |
| angular-system-error-log-reports-api | 3 | `af5eaaef486626fff1d4354733e65c1a9458f5ef9609f6286761ecb451b0998c` |
| angular-system-error-log-reports-api | 4 | `dae0a8847e44166632877639f7e93fc1a1262ee7002bda5355bcd1760d2c3a68` |
| angular-system-error-log-reports-api | 5 | `3e6d9e67aea112290c14f307c982dc4422ce1797a871b9b987994981f78d8723` |
| angular-system-error-log-reports-api | 6 | `df0dc6ec5bd68ab7fc21c09cee491973d00caacc2610c7aac7123a97cb31fd70` |
| angular-system-error-log-reports-api | 7 | `6b5a31169e46bb252b0ed56eb85abd716a87d874baa33973d080d38a2c31fa71` |
| angular-system-error-log-reports-api | 8 | `1ec0e54b3e2444a14359521d9da0f0c59a3c0f17284a40bd3c54369d44a4ae59` |
| angular-system-error-log-reports-api | 9 | `1ddff9f3055780218661a25e809c013f8ae479eced425af4ce7f9c803c473ee9` |
| angular-system-error-log-reports-api | 10 | `bdfecdeaebe5da652531314b0993ce8305ec61732bb2a9c3bc48a95a44ad8702` |
