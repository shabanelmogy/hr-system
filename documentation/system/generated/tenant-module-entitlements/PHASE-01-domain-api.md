<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Tenant module entitlements Phase 01 - Domain and API

## Purpose

Build the server contract first so both clients consume one stable model.

Execution reference: `documentation/api/Feature_Module_Implementation_Checklist.md`.
The applied feature profile supplies evidence; the generic checklist supplies the
implementation discipline.

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

- **Tenant module entitlements cross-platform master review:** `../project/TENANT_MODULE_ENTITLEMENTS_FEATURE_FULL_REVIEW.md` sections 3, 4, 6
- **Tenant module entitlements API implementation profile:** `../api/TenantModuleEntitlements_API_Implementation_Profile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| tenant-module-entitlements-master | 3 | `212764afdc3ce2ce0f4bd27da0a48644dadb0f63c0edd3b9102bbabe1a727e99` |
| tenant-module-entitlements-master | 4 | `e555dc9d04feebee880d75fafd06d4fa2c525673d99cc4476055e8b15cfe36ab` |
| tenant-module-entitlements-master | 6 | `5dda69ba2342bfa1f8caee1dee1868a383b4d7c1ce1f7596a753e20c4aba1cfb` |
| tenant-module-entitlements-api | 1 | `5da0d07803f38c790d1b6f8d545ab301c5469f1e42b4f9fe1f0da8012419e128` |
| tenant-module-entitlements-api | 2 | `baaea80c2d3ba4ba222f653018a9db08222128a6289bb2ec07f18327d165913f` |
| tenant-module-entitlements-api | 3 | `b446d78a5c1e23da512f04a98540550f0374d6aaa6dabad5d7ade5e56a3da52f` |
| tenant-module-entitlements-api | 4 | `f0d0baac0931a1b0bd2719182cb288a3ccc110cac2cb40725af98f689b2cbad8` |
| tenant-module-entitlements-api | 5 | `92dea9195f8302c0a561f2c51ea535fcac4965f9a38ba6b341c28df9d8332ef6` |
| tenant-module-entitlements-api | 6 | `c28dea9f9be1779904436fbc0e7db9b0303a16d90b7c6a279f165f878c551bfe` |
| tenant-module-entitlements-api | 7 | `a6814b16a6f916017847c1eee0b2a6f2a183f657f2813f888675eaaa4dbbe58a` |
| tenant-module-entitlements-api | 8 | `c37c50acf4176e243388ef9a13427e4eae964c0da2d59c75c49a3ca3f8226094` |
| tenant-module-entitlements-api | 9 | `0adb2ee75634988ab88fd78d7351ee7fc600985d803b15bb47e399b0144152f9` |
| tenant-module-entitlements-api | 10 | `bcc7ef77c03aba1632b982232bdf6c92b819081cab9cb1805446bd76096aaf6b` |
