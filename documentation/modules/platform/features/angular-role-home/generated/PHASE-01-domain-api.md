<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Angular Role Home Phase 01 - Domain and API

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

- **Angular Role Home cross-platform master review:** `../modules/platform/features/angular-role-home/angular-role-home-review.md` sections 3, 4, 6
- **Angular Role Home API implementation profile:** `../modules/platform/features/angular-role-home/angular-role-home-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-role-home-master | 3 | `e048bd0ced8c61c21dd123c60b8970593fb7caec43ef695f3a15d43ce1ba450d` |
| angular-role-home-master | 4 | `0b512f0ad7afaa343b36e43ab0148064b2a42e0dd51f3d682d7de6e0570920e6` |
| angular-role-home-master | 6 | `e127c53db94b549e9a0839a46884007b0cb45407d19b1f32fe03d7fbc884e21d` |
| angular-role-home-api | 1 | `f984be175a16c176b96a040e2653b65d903c05bee762fe5a3c150470c6a97bb5` |
| angular-role-home-api | 2 | `b897606c0ca6644b476e0d49a4efb8d0c00b2b42c1b37d8f6282224dcb9ad071` |
| angular-role-home-api | 3 | `e048bd0ced8c61c21dd123c60b8970593fb7caec43ef695f3a15d43ce1ba450d` |
| angular-role-home-api | 4 | `0b512f0ad7afaa343b36e43ab0148064b2a42e0dd51f3d682d7de6e0570920e6` |
| angular-role-home-api | 5 | `563cf43ec82636430fe4e20f38f8398ba1e21e6344b16f5d7af85ccd4943fec2` |
| angular-role-home-api | 6 | `e127c53db94b549e9a0839a46884007b0cb45407d19b1f32fe03d7fbc884e21d` |
| angular-role-home-api | 7 | `c1c548649c4b8f25bfa58b9c5e31aff3d5b9dd128868657c9f2295058e414d4d` |
| angular-role-home-api | 8 | `d28963b7a469ef83b975e057f57db47703ca3b8fd120d21ff3b4b6497b8a656f` |
| angular-role-home-api | 9 | `60f9c606d5d26a6f8a4c4dc82559183bcd0269bd903190817574405dbd36670f` |
| angular-role-home-api | 10 | `1c839c0e89ee2594c02d7b00912de2fcf2e0690ef23d50b52255e5491a33fe20` |
