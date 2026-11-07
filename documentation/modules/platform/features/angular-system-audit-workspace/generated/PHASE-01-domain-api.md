<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Super Admin System Audit Trail parity Phase 01 - Domain and API

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

- **Super Admin System Audit Trail parity cross-platform master review:** `../modules/platform/features/angular-system-audit-workspace/angular-system-audit-workspace-review.md` sections 3, 4, 6
- **Super Admin System Audit Trail parity API implementation profile:** `../modules/platform/features/angular-system-audit-workspace/angular-system-audit-workspace-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-audit-workspace-master | 3 | `533fc06c805178a7940bd29b028ccab1aa8c03323688c0ef84db7cfe11866f11` |
| angular-system-audit-workspace-master | 4 | `0ca0921366f0d0203bf10ec88a16b5676345f89ab9076973861c17b47bda4646` |
| angular-system-audit-workspace-master | 6 | `d011d247abc657b5c966a73d18c39821472514d0caf9456b02ae0249a098165e` |
| angular-system-audit-workspace-api | 1 | `30180a45e3e26ad0647e71a3cdfb4292151787ebf1c71e14939c79eb98e7c78a` |
| angular-system-audit-workspace-api | 2 | `ec1abfdbe1d6f23f81c35becb8e10e65908b6e7253be193981561639cc70f3c5` |
| angular-system-audit-workspace-api | 3 | `533fc06c805178a7940bd29b028ccab1aa8c03323688c0ef84db7cfe11866f11` |
| angular-system-audit-workspace-api | 4 | `0ca0921366f0d0203bf10ec88a16b5676345f89ab9076973861c17b47bda4646` |
| angular-system-audit-workspace-api | 5 | `e8eefe6fd4499461e5ef5fee1027cece0a67a6eb23675be5e2a7da7dea4bd9b1` |
| angular-system-audit-workspace-api | 6 | `d011d247abc657b5c966a73d18c39821472514d0caf9456b02ae0249a098165e` |
| angular-system-audit-workspace-api | 7 | `da87f59916f591acee86e14bb3dd36aeda9bfc9ea39d1d8118b370e657f93cf4` |
| angular-system-audit-workspace-api | 8 | `fe1dcbe0ed968bf0bd8847d263bcd2a32b5c1392f51e4ec8d7d72480c94d2008` |
| angular-system-audit-workspace-api | 9 | `bfe3c56110cb9e2dd3ff1d6ae28f28e836cc6795916976cc5ea125d1960c2a97` |
| angular-system-audit-workspace-api | 10 | `7bae6bcb1db81bd9577afd59216566fa86f1eca6cc68d0bf365b9bb35af8dc96` |
