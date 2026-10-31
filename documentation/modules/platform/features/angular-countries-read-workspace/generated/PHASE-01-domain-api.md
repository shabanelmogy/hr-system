<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Countries read workspace Phase 01 - Domain and API

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

- **Countries read workspace cross-platform master review:** `../modules/platform/features/angular-countries-read-workspace/angular-countries-read-workspace-review.md` sections 3, 4, 6
- **Countries read workspace API implementation profile:** `../modules/platform/features/angular-countries-read-workspace/angular-countries-read-workspace-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-read-workspace-master | 3 | `900d99a68a5e3fb4b45f4d01d3278357a90c1bef05562b27edd672021635ebe6` |
| angular-countries-read-workspace-master | 4 | `73f5a7101a9e9f4423d8539c612013ba7eb1541d388fb44669919a8f2779bc62` |
| angular-countries-read-workspace-master | 6 | `4aa2e516e6ef412cfb58f2d8ccc71961358af0545fb78f9128ec63fdfa43b512` |
| angular-countries-read-workspace-api | 1 | `b5f697f101f4ffcc3964a2bdf2f34aad6a9afdf2f2ef8e519d939ab62aab7b03` |
| angular-countries-read-workspace-api | 2 | `51f1e1d285b87461fffb80a80d433a26b836b3b254d99b2ede854d698aa9cc1e` |
| angular-countries-read-workspace-api | 3 | `900d99a68a5e3fb4b45f4d01d3278357a90c1bef05562b27edd672021635ebe6` |
| angular-countries-read-workspace-api | 4 | `73f5a7101a9e9f4423d8539c612013ba7eb1541d388fb44669919a8f2779bc62` |
| angular-countries-read-workspace-api | 5 | `3704acfa0146fdc1b48ca9f3465476082e5cce31454a7ab150b2149b60faf524` |
| angular-countries-read-workspace-api | 6 | `4aa2e516e6ef412cfb58f2d8ccc71961358af0545fb78f9128ec63fdfa43b512` |
| angular-countries-read-workspace-api | 7 | `20af956b014674166cbc688b3813fff95ab1ed9a22bc27580172876834718601` |
| angular-countries-read-workspace-api | 8 | `9c477e9921fce73d5b4db42fb8fd55aa1152683205584719fbec91024291702d` |
| angular-countries-read-workspace-api | 9 | `9956bd77de0553081068027e0cf412fb7f2ac7d411995786f17e1f2d5ddd6c6d` |
| angular-countries-read-workspace-api | 10 | `351549c64b8a2862ebda6e01484037ddf3730522101fa8d1379a763aceb43ac9` |
