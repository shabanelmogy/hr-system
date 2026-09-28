<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Managed Crystal Contract Registry Phase 01 - Domain and API

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

- **Managed Crystal Contract Registry cross-platform master review:** `../project/MANAGED_CRYSTAL_CONTRACT_REGISTRY_FEATURE_FULL_REVIEW.md` sections 3, 4, 6
- **Managed Crystal Contract Registry API implementation profile:** `../api/ManagedCrystalContractRegistry_API_Implementation_Profile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-contract-registry-master | 3 | `868e9bbb67b82d3949d71fde30b56870b8dde13c345793fdf5f3aca712d3e048` |
| managed-crystal-contract-registry-master | 4 | `8f299058d6b0fa1871fc583289549498805511fc5edcd4283b6cd1f6fb06f516` |
| managed-crystal-contract-registry-master | 6 | `e987bebc42adb87b9650b15783b0f6a5619c9207ba2a847e75674a4775c40e24` |
| managed-crystal-contract-registry-api | 1 | `9d1e6de5fe56e8d9e0ef68953fe9265a54d04420f403e425aaf8872fef56ea9d` |
| managed-crystal-contract-registry-api | 2 | `9a32c986ec378610727421758ca4ad04634f4f0ee5f40aec8e5fd78c8ea1b28e` |
| managed-crystal-contract-registry-api | 3 | `fa1631b65dbb1ccb1213fc66fb6a9c642b063975d949c5dbea70a7ae2207f951` |
| managed-crystal-contract-registry-api | 4 | `0b96b03ed82f1a7c8505853f6ced5f99cd4616657e66d95b1b3baa3d40e185b4` |
| managed-crystal-contract-registry-api | 5 | `0d6eb572f66603428518ad0cc762999453bfae52fe45ed934bdf5f19059ace8e` |
| managed-crystal-contract-registry-api | 6 | `3c4e425d69cbd361887a897498fc7a23c074766613e4a02d323b6176b2bcffdb` |
| managed-crystal-contract-registry-api | 7 | `a5c077ea645efaf01230c8a3d0c6e1b0c7ec92885b9588cffadb78d608910187` |
| managed-crystal-contract-registry-api | 8 | `4593669845c25df873284a06dbadc97c7e2d29c6b52cf4bb4f9968a227e5f6d9` |
| managed-crystal-contract-registry-api | 9 | `335282f390d3ced85346c45a0e4e8f548e2be6f5a4ec483fc507578329901db0` |
| managed-crystal-contract-registry-api | 10 | `946142661a68c5e3852151f10a8b14bb82f665bf0003c1cabfbb45bd5185121f` |
