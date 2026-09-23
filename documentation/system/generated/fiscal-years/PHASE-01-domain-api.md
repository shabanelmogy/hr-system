<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Fiscal Years Phase 01 - Domain and API

## Purpose

Build the server contract first so both clients consume one stable model.

Execution reference: `documentation/api/API_FEATURE_DEVELOPMENT_WORKFLOW.md`.
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

- **Fiscal Years cross-platform master review:** `../project/FISCAL_YEARS_FEATURE_FULL_REVIEW.md` sections 3, 4, 6
- **Fiscal Years API implementation profile:** `../api/FiscalYears_API_Implementation_Profile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| fiscal-years-master | 3 | `8390cefc7a311be46bc6e92580fcbe7aff06ff47aaa4ac187f90cd7e66903da8` |
| fiscal-years-master | 4 | `a138eeba03b2c75a88c481f8ecad0b88cd339b53f5c26f67fc52bf62d2da13bf` |
| fiscal-years-master | 6 | `a441290822263415d40f5bdaca531bce89957f82d6491760dac44cab5853fe6e` |
| fiscal-years-api | 1 | `c5cd5261f849189a2749a31cd78e70e9245714e5d8c28b7f8dacb8285b23b92c` |
| fiscal-years-api | 2 | `02d18d2d40635c247dd35aabe02cd296212efe5cb30da3a8e834f5e0c9877e8e` |
| fiscal-years-api | 3 | `44970c0fb772eb86a62f0ea45e141c7d993b7060480314e2b05ee7fc83cfdc3f` |
| fiscal-years-api | 4 | `1e69de36f54c56ace43f1c0d1fc3071374d91f7e473e1439011b21d51b55efcd` |
| fiscal-years-api | 5 | `ba8176ed5d7ccdae35e2e28dbf19753c72676ad255c6787cf74c3a0dac821529` |
| fiscal-years-api | 6 | `748acbb8a884f50f81cdf9e854ef7f784765a8f2781f904bf2a90f5872ed6c64` |
| fiscal-years-api | 7 | `bb9330bdbdb4a33564e6b4560a0a2709d55cca905f26b079bd9507f9bb0276ad` |
| fiscal-years-api | 8 | `da26f9374d1461299ddd9043d1a72414d6f63e7df4cd8babe579a9c9382cebb2` |
| fiscal-years-api | 9 | `544d5cc0a769e20f76567b5d1560052dfb950882220b506c0f911cdaa22170bf` |
| fiscal-years-api | 10 | `a823f2200f91e5603cc9dcb22e2fa57d513a7442a3485fa03ed8c3ee1fcc5715` |
