<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Angular Application Shell Phase 01 - Domain and API

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

- **Angular Application Shell cross-platform master review:** `../modules/platform/features/angular-application-shell/angular-application-shell-review.md` sections 3, 4, 6
- **Angular Application Shell API implementation profile:** `../modules/platform/features/angular-application-shell/angular-application-shell-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-application-shell-master | 3 | `f2aacdc73cc17945bc17eb5c69923fbdf857d48106aba97f6953101712ccc647` |
| angular-application-shell-master | 4 | `caf058a22c30460e1e9b20a688f77f8ced402b30e75d5e7619a99c59618b66b4` |
| angular-application-shell-master | 6 | `faabbbe88bf326eea9511bbf97bec39a1b42c35ce2230c655e71672291c3231c` |
| angular-application-shell-api | 1 | `8420f91086a38d7869bb125bbf216e4334ec46e04700b4dfe8662f2e77609f95` |
| angular-application-shell-api | 2 | `832cb5332e6be88662481f48f16fdc3a2fa6b0c2b135e9ed874308ded3bf9051` |
| angular-application-shell-api | 3 | `f2aacdc73cc17945bc17eb5c69923fbdf857d48106aba97f6953101712ccc647` |
| angular-application-shell-api | 4 | `caf058a22c30460e1e9b20a688f77f8ced402b30e75d5e7619a99c59618b66b4` |
| angular-application-shell-api | 5 | `37689c61ee256203558078245aefc583e90e595faf6b21072222d367bc563cdd` |
| angular-application-shell-api | 6 | `faabbbe88bf326eea9511bbf97bec39a1b42c35ce2230c655e71672291c3231c` |
| angular-application-shell-api | 7 | `38103c6fc5fc366e8d4808935148f4982bc2ff7a1077bc6b47866a5a59341914` |
| angular-application-shell-api | 8 | `ca4ee16c814aceee76194125377f3bd6b8f2007d2ba647b8d7ddbdae5617834e` |
| angular-application-shell-api | 9 | `171a213120b293cd32c3bb0e2ec90a86d4baff38de60c8ec38a72053fa61aced` |
| angular-application-shell-api | 10 | `99e22673f4a63eb2aa922a85364d71c0c32f7b06bf02467ab629acd0288e8de1` |
