<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Managed reporting adapter preparation Phase 01 - Domain and API

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

- **Managed reporting adapter preparation cross-platform master review:** `../modules/platform/features/angular-managed-reporting-adapter/angular-managed-reporting-adapter-review.md` sections 3, 4, 6
- **Managed reporting adapter preparation API implementation profile:** `../modules/platform/features/angular-managed-reporting-adapter/angular-managed-reporting-adapter-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-managed-reporting-adapter-master | 3 | `0a8d888ba28cd7d35ccaaf15d92162d047c48a3482e973322396688b5d08e520` |
| angular-managed-reporting-adapter-master | 4 | `0d75a0cc98ed3a106e8343d19526c34b38a8aa4ce019633d33510a6df070b725` |
| angular-managed-reporting-adapter-master | 6 | `7ddf91640d39b54272167893efb83e1111050dce8b98d44d9b1a94e99b53523f` |
| angular-managed-reporting-adapter-api | 1 | `700d6af9c12803135af2dc8f08b8123b1a97dc3ffde723af1b3995a8004092a3` |
| angular-managed-reporting-adapter-api | 2 | `bfad8afecaea948e75f03de736c5379d100b426827cb85889e5f14898235baae` |
| angular-managed-reporting-adapter-api | 3 | `0a8d888ba28cd7d35ccaaf15d92162d047c48a3482e973322396688b5d08e520` |
| angular-managed-reporting-adapter-api | 4 | `0d75a0cc98ed3a106e8343d19526c34b38a8aa4ce019633d33510a6df070b725` |
| angular-managed-reporting-adapter-api | 5 | `6241b5fb0db88e111491eed08e0dcb92e8386fe3b26867510d4cd5f29f7d3d2b` |
| angular-managed-reporting-adapter-api | 6 | `7ddf91640d39b54272167893efb83e1111050dce8b98d44d9b1a94e99b53523f` |
| angular-managed-reporting-adapter-api | 7 | `6cef15e087ca9135e2e920cff1c04ee79be87ad22f23806e486bd03344b31515` |
| angular-managed-reporting-adapter-api | 8 | `ccd65bd62ffc69968dd25b5533dce7903889333438951fd55ff4f1fcf34a15a4` |
| angular-managed-reporting-adapter-api | 9 | `134f6c9e94fe56442f0bda990b5c3b4f33cdaf72115b8973b40c9ebec4fc79fa` |
| angular-managed-reporting-adapter-api | 10 | `36f180ef4c51ad92659ec0c8848c07e2636ccbb9bb6c3b1f12d982b41b09d353` |
