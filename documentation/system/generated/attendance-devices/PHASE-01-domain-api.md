<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Attendance Devices Phase 01 - Domain and API

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

- **Attendance Devices cross-platform master review:** `../project/ATTENDANCE_DEVICES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6
- **Attendance Devices API implementation profile:** `../api/AttendanceDevices_API_Implementation_Profile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| attendance-devices-master | 3 | `c6619586b58ca9eca3be36bb6d10bb72d97f3cdb67b4f49ebca55e90bc29ca5c` |
| attendance-devices-master | 4 | `883d12a168ad1f5a7d103912e0541748d3d3a692be6eea2417865a39f5e2ea18` |
| attendance-devices-master | 6 | `d4d02053ca38139b5ea51928c18352d2ad86e08b3b1308b3d3fa58fab55db761` |
| attendance-devices-api | 1 | `11075753c6e727cc846cd3707be4292ff613548892ea5dac171ac5980221c113` |
| attendance-devices-api | 2 | `fa11797ee9511a578fd7355c91f6e88d6ab1d1ffb23a961818977504c9336fa8` |
| attendance-devices-api | 3 | `4617086d98fccc485b40c1ef1692b89f2422e98e4168dc1d18724d3f3ed01998` |
| attendance-devices-api | 4 | `28440ff3b81525bf589377e414438cfe701f85255183e7c37abbd7519acdc848` |
| attendance-devices-api | 5 | `2a77df06126b0f05c4bb73f1bb43b867e5809f002ace837e8bbc43c225593c15` |
| attendance-devices-api | 6 | `04b10c6fab5a3391b343a064d4d6d9d33290090eb6472769ac524cd25f50cb90` |
| attendance-devices-api | 7 | `389927ae77a95de5e5ba2a07fe29fb54e853f893118e9b1036b567b53599d34e` |
| attendance-devices-api | 8 | `f78bbaac90ebc303e057c975714f5a06e0bf81574edf89265c4893e1609e09ab` |
| attendance-devices-api | 9 | `0a86e958c61b0f6569cecb994467e0942249cdfdfc670af54a5ba7fff895ec19` |
| attendance-devices-api | 10 | `9c74502942c3903fa9369c7e948976624dec6f63b07ab06e2272b1c152cea6ef` |
