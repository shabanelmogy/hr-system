<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Shared unsaved navigation and context protection preparation Phase 01 - Domain and API

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

- **Shared unsaved navigation and context protection preparation cross-platform master review:** `../modules/platform/features/angular-unsaved-navigation-foundation/angular-unsaved-navigation-foundation-review.md` sections 3, 4, 6
- **Shared unsaved navigation and context protection preparation API implementation profile:** `../modules/platform/features/angular-unsaved-navigation-foundation/angular-unsaved-navigation-foundation-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-unsaved-navigation-foundation-master | 3 | `759da36881cb7dd27e8bc716118ea565e36dfa9ecd48e0e00d42db465a8f02b0` |
| angular-unsaved-navigation-foundation-master | 4 | `2d58c0161cfcb36c86ca393a6a5ec8f098ada807d4d0e96804bafc8983adfa3a` |
| angular-unsaved-navigation-foundation-master | 6 | `fd1302a727902105771ff702edcef4fed293c85eb54daa95d9d57f3caf84fa3c` |
| angular-unsaved-navigation-foundation-api | 1 | `7c5159891c1b522f39583996cc03b89d729ab2601de7c28da4cd09a58db4decb` |
| angular-unsaved-navigation-foundation-api | 2 | `79e5a97f176aa796f1eafec856bbc2fef44fe4e15909fc9e9a4af11a081d9bdd` |
| angular-unsaved-navigation-foundation-api | 3 | `759da36881cb7dd27e8bc716118ea565e36dfa9ecd48e0e00d42db465a8f02b0` |
| angular-unsaved-navigation-foundation-api | 4 | `2d58c0161cfcb36c86ca393a6a5ec8f098ada807d4d0e96804bafc8983adfa3a` |
| angular-unsaved-navigation-foundation-api | 5 | `a0d875b6c17ba506eff2ec67858ddf6be03398c262c294ffb637a058e753f9b9` |
| angular-unsaved-navigation-foundation-api | 6 | `fd1302a727902105771ff702edcef4fed293c85eb54daa95d9d57f3caf84fa3c` |
| angular-unsaved-navigation-foundation-api | 7 | `df7297b5bc050edb057a770df55d5088be19599dcc6bae960a2f0dd11e02e09c` |
| angular-unsaved-navigation-foundation-api | 8 | `102e05d9052cbe150f9838d835dcf3236fb078cddb9870e1026195410c01f87e` |
| angular-unsaved-navigation-foundation-api | 9 | `3a1057f037bc3b51ed5b9a18e3318ae5af9cc03b192c60d47ef3a5b817d786aa` |
| angular-unsaved-navigation-foundation-api | 10 | `0b1dd9dc51445c019adb6e53cf01354dd7c27ad536b2fb307472c04731833c0e` |
