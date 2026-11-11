<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Super Admin Tenant Administrators parity Phase 01 - Domain and API

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

- **Super Admin Tenant Administrators parity cross-platform master review:** `../modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-review.md` sections 3, 4, 6
- **Super Admin Tenant Administrators parity API implementation profile:** `../modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-tenant-admins-workspace-master | 3 | `cb02ff3daf5730e7aa4f8f626540354ce6d3535dc626424c37dda120a2e7a7be` |
| angular-tenant-admins-workspace-master | 4 | `b312109aea85caea32a57fdcec24284fbf6883425ce0a13e933303f35fe09339` |
| angular-tenant-admins-workspace-master | 6 | `9d15f52db14b58a5e479be4391307c4b6c02b878731e5c7db257054d35ec6378` |
| angular-tenant-admins-workspace-api | 1 | `059b48fa0b389f7a89dd01463313ba0c1db2772d2b10defb8630096f571c0ee8` |
| angular-tenant-admins-workspace-api | 2 | `99920dbd79c8c9d191ef7c37a64abf24af13da54217b04b7dfd0328f44590f86` |
| angular-tenant-admins-workspace-api | 3 | `cb02ff3daf5730e7aa4f8f626540354ce6d3535dc626424c37dda120a2e7a7be` |
| angular-tenant-admins-workspace-api | 4 | `b312109aea85caea32a57fdcec24284fbf6883425ce0a13e933303f35fe09339` |
| angular-tenant-admins-workspace-api | 5 | `631f5b4c6d895179bbac8ed909ffbcb9fb5adc5d831eeb6a06c78936600a6e8b` |
| angular-tenant-admins-workspace-api | 6 | `9d15f52db14b58a5e479be4391307c4b6c02b878731e5c7db257054d35ec6378` |
| angular-tenant-admins-workspace-api | 7 | `2c923981c40da00473fa4db151327a1323a4a1cfd247879bb0ea9b8f7815b15c` |
| angular-tenant-admins-workspace-api | 8 | `1e18636edbe60a282f77f2ab441b85f2359c9ea6051fabca7360c592e925719f` |
| angular-tenant-admins-workspace-api | 9 | `9fc33d645ccd7ddc8a3900ab3265c732e553c5894ab8e2219f201cfe91081800` |
| angular-tenant-admins-workspace-api | 10 | `9d9e0e66e19ccb5487a50d725ad157fc49323d97f3e1bc6fd76370ffb0429bb3` |
