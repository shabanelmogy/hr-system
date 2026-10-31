<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Countries pilot preparation Phase 01 - Domain and API

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

- **Countries pilot preparation cross-platform master review:** `../modules/platform/features/angular-countries-pilot-preparation/angular-countries-pilot-preparation-review.md` sections 3, 4, 6
- **Countries pilot preparation API implementation profile:** `../modules/platform/features/angular-countries-pilot-preparation/angular-countries-pilot-preparation-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-pilot-preparation-master | 3 | `501ef0b9eef132639e93fb02b0f8576e649d544ebbbf5196b1247ef045af7682` |
| angular-countries-pilot-preparation-master | 4 | `1c73770cd45e7c8c070200ef9519ac7fd1c97478c2fcba4f3cf85560391068c1` |
| angular-countries-pilot-preparation-master | 6 | `63f6cadc90c5b7a65d7ada2d9804750ba56b1b0b45d29aade44d6131b4c38a06` |
| angular-countries-pilot-preparation-api | 1 | `898dd20117fd133d99fd5362d06fb22e1cddec3df90c9eb782f01898d5440119` |
| angular-countries-pilot-preparation-api | 2 | `ef54c6e76fe4a7268ce85507ba52fa3ca1ab5d4a9903be2815811016b72a9ff2` |
| angular-countries-pilot-preparation-api | 3 | `501ef0b9eef132639e93fb02b0f8576e649d544ebbbf5196b1247ef045af7682` |
| angular-countries-pilot-preparation-api | 4 | `1c73770cd45e7c8c070200ef9519ac7fd1c97478c2fcba4f3cf85560391068c1` |
| angular-countries-pilot-preparation-api | 5 | `d8bd919c83a5678c9ebdddfcf75f989e353d963870222c1a5f116e0f2b20fc5d` |
| angular-countries-pilot-preparation-api | 6 | `63f6cadc90c5b7a65d7ada2d9804750ba56b1b0b45d29aade44d6131b4c38a06` |
| angular-countries-pilot-preparation-api | 7 | `47a9d24047af73aaf314c020f9296502e9d68a99fba5c5869fa3afcd4a60674d` |
| angular-countries-pilot-preparation-api | 8 | `6de19e9783c84f5dae33a0930b620ad41f23271249357863cc6b5674b112db4e` |
| angular-countries-pilot-preparation-api | 9 | `cf8e09d2816484ef5fe1b3d550ed61098cb7739b6e69934182c068724c7fab6b` |
| angular-countries-pilot-preparation-api | 10 | `99ebce40b5bf08863732dc80464d3f3199aa700b4358f38675af7ba7e1caf6f3` |
