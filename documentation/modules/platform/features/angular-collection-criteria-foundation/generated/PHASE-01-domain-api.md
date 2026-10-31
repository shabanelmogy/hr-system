<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Shared collection criteria URL preparation Phase 01 - Domain and API

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

- **Shared collection criteria URL preparation cross-platform master review:** `../modules/platform/features/angular-collection-criteria-foundation/angular-collection-criteria-foundation-review.md` sections 3, 4, 6
- **Shared collection criteria URL preparation API implementation profile:** `../modules/platform/features/angular-collection-criteria-foundation/angular-collection-criteria-foundation-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-collection-criteria-foundation-master | 3 | `e120bae9424f50678f0c7cc941f0d8149350391eaf09474ccbc5092ac324120a` |
| angular-collection-criteria-foundation-master | 4 | `bcf2c705898c5e13f7a4b5bc6b350f2ee08fff544ba58a8525ccec6b36720864` |
| angular-collection-criteria-foundation-master | 6 | `0b2ae962f994a597a781fc41c0f929c39c5fde0d2719e1e7a5044162464bd027` |
| angular-collection-criteria-foundation-api | 1 | `533d7d7e5bbece37a3fe439f8356343c5c6e32149acd09efae03b70390162f1e` |
| angular-collection-criteria-foundation-api | 2 | `fde38cd94f53af728f6c35253ef0a93a7b82029b204a20b593656b5d297a083c` |
| angular-collection-criteria-foundation-api | 3 | `e120bae9424f50678f0c7cc941f0d8149350391eaf09474ccbc5092ac324120a` |
| angular-collection-criteria-foundation-api | 4 | `bcf2c705898c5e13f7a4b5bc6b350f2ee08fff544ba58a8525ccec6b36720864` |
| angular-collection-criteria-foundation-api | 5 | `b26b87322048e11590e55342af5142b1a15eb66624a7a0565a0e13c1d67303bc` |
| angular-collection-criteria-foundation-api | 6 | `0b2ae962f994a597a781fc41c0f929c39c5fde0d2719e1e7a5044162464bd027` |
| angular-collection-criteria-foundation-api | 7 | `1d85249d77efc9832fc5f094b4a3dd8b26add9e8fb63d4f71adb9f121d9cb791` |
| angular-collection-criteria-foundation-api | 8 | `edb03e0306a5c1288467e8473feb2d2ac2a124ea340b41fd06c98df22d02bd9c` |
| angular-collection-criteria-foundation-api | 9 | `f5dee5a7372a530fad3f09162a7ff49f3dce3d00ab98770778cd64a826e95939` |
| angular-collection-criteria-foundation-api | 10 | `02ba8586978267daf88bbdae9c6f80c10475256d6e6d22678381eb3524460df7` |
