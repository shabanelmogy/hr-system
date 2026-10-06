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
| fiscal-years-master | 3 | `258121a15c42bd254f087460a281f57839ee2f56a36f373905ca0c952ed6cbe9` |
| fiscal-years-master | 4 | `ae8155eb0f3e367113ca06829c8dc5a977d40f300ab07eac4bc4c0d34b923075` |
| fiscal-years-master | 6 | `225416faf8af3c0eb0b46137e7224277e9ffe1f40b17bd0395016d24ec503d41` |
| fiscal-years-api | 1 | `c5cd5261f849189a2749a31cd78e70e9245714e5d8c28b7f8dacb8285b23b92c` |
| fiscal-years-api | 2 | `ae653c64f50a4999b622bc97571430b7282dbbbb2cdd5b0f5dc71b259634f73a` |
| fiscal-years-api | 3 | `f5697c3f1e8c3484d321d18b59cfbb0f8bd906d3fa9811f633fdcb826635b2b4` |
| fiscal-years-api | 4 | `8ceae848336bcb4eb60b70be37be8e9873eebcd2f8aabc992600826d70e81392` |
| fiscal-years-api | 5 | `db2558d097a050e8c10a878fce3de7ed165ce1b0d87fd9067b0c6b4181d2361f` |
| fiscal-years-api | 6 | `c5998a179675a1f801e330509699f991bf223f3f49c5e158934d2d886349a163` |
| fiscal-years-api | 7 | `efd0c753281b11a611dd17356e619f87e58bcbb6ab1c042cb6997a82100a7cf4` |
| fiscal-years-api | 8 | `8ab3db43e90da415c85d888ed99bee69d8defd0c62f107f2a6fed1994174ad94` |
| fiscal-years-api | 9 | `e6802156db1e14e4b79fe94b30908e1c5e32313abe23d80cda90711a0ad7f5e6` |
| fiscal-years-api | 10 | `5b8ce0adc32dc41cbb93e1626d24d17e3d8a7e1ed177b6f3fa6241c441c10bee` |
