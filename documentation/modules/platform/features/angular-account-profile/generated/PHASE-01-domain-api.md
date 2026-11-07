<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Angular own account profile and password parity Phase 01 - Domain and API

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

- **Angular own account profile and password parity cross-platform master review:** `../modules/platform/features/angular-account-profile/angular-account-profile-review.md` sections 3, 4, 6
- **Angular own account profile and password parity API implementation profile:** `../modules/platform/features/angular-account-profile/angular-account-profile-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-account-profile-master | 3 | `05547cc9418b3c0fb9169c218ceafd746a6f4e0ffd41909784fddbf12c28f4d4` |
| angular-account-profile-master | 4 | `56b31df492f4c4b102eeb2517deb5b9210e0630d9e03d8fa9c9562df7349a264` |
| angular-account-profile-master | 6 | `a240983bf992c17a33cb7680bacfe0ef92dd3e2694296b1f3199cba091beca34` |
| angular-account-profile-api | 1 | `07e0d48b145ebcb831af7a219120ae82ba579cded649137f3c5f067d4725703b` |
| angular-account-profile-api | 2 | `ed6996e0db124afde5c18214e2f9046ef70d7bfac8ac0b6bb40fa6e6e092bca4` |
| angular-account-profile-api | 3 | `638be095c61773a0692103777146795622aff70555f0721d716cee893b978ccd` |
| angular-account-profile-api | 4 | `90c560420fdf347eeabcc6f27454ca296acef1abd8198f7f3c223373f250802c` |
| angular-account-profile-api | 5 | `53e69a080141004026d14c8355451b1142e140fbefa11c4bfc75b634ebd6c0b3` |
| angular-account-profile-api | 6 | `de2a02c83421dcbf788b87e6fbbe010b76eb0c5cd94b7f5d8a3f1ff62b8afe69` |
| angular-account-profile-api | 7 | `abd2e1abc8683325404db6045b06643b24f4a0607163eb22984070f46ed0dfb1` |
| angular-account-profile-api | 8 | `1e50eb56692bd565bb3353f0168de1eabbf9e0a92593a86357eb09f345ca62e0` |
| angular-account-profile-api | 9 | `ed13c68f331c3038939666427a9cc5068f8ad01b05b5678e7375e9c1b493cd36` |
| angular-account-profile-api | 10 | `39a850bc1222626cc35fa79f92f2e7bdf4fa4bdc9ee114f980916a360cd7c9c7` |
