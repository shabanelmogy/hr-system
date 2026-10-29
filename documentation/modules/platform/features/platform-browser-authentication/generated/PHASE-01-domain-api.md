<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Platform Browser Authentication Phase 01 - Domain and API

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

- **Platform Browser Authentication cross-platform master review:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-review.md` sections 3, 4, 6
- **Platform Browser Authentication API implementation profile:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| platform-browser-authentication-master | 3 | `345220b1eaa0e529ed3d55776cd852c9a5c82af7c4d7972601479aca3f55dc9f` |
| platform-browser-authentication-master | 4 | `0505f838bd9f13d3144554c0ec84c5ede68b9a4c88979c80f6692106e100f94f` |
| platform-browser-authentication-master | 6 | `3f6972c09887aa9b387d77f91d23c2f2e48de37583bdb9cc0506f94dd1d5a8c4` |
| platform-browser-authentication-api | 1 | `ae3f47594eb5c38ab7ef48648472b2b48001d38e679966e085d1651070578ee0` |
| platform-browser-authentication-api | 2 | `1a067a020f97b02539fb7b80156030d9637106e472435692f23c66c99f5350ca` |
| platform-browser-authentication-api | 3 | `3aa5be81fd076aae127a2be57dde7b5cc267f94f0910e7677685bcd3e23f62ec` |
| platform-browser-authentication-api | 4 | `78cb7010d80893095322f037725ac416eb8b02e44b6560b96a9e77e0eb98d388` |
| platform-browser-authentication-api | 5 | `82c71ffe7d67f682c104403017dde886e5c79ab29367c6d52aabb4c59c683821` |
| platform-browser-authentication-api | 6 | `0a34aee7b4d1e0ac784f4f0ade83e50ddf83b91678b6a3b4a8247bda1e8df0d9` |
| platform-browser-authentication-api | 7 | `0f32a5dfac86eff41cdc984b55819fb02961dc8219b55db378d3c29ec470e842` |
| platform-browser-authentication-api | 8 | `26cc4d301319e508521dc58bb8dcd580b32bb021be0b65eb63efb67d48ee244d` |
| platform-browser-authentication-api | 9 | `19ce75cffb7afc5152f3f28adc221e860d2ef8b40eb3c4f3de9357c951ba4c99` |
| platform-browser-authentication-api | 10 | `0e4108d4382344db7c74d76883a2e1b7804947764162e3298fbd32e9cf365e67` |
