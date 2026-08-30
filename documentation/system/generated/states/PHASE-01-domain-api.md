<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# States Phase 01 - Domain and API

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

- **States cross-platform master review:** `../project/STATES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6
- **States API implementation profile:** `../api/States_API_Implementation_Profile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| states-master | 3 | `43ea42762d08c208b038c7153dceed19ac895f80b529c18126fca78ffc532b39` |
| states-master | 4 | `5a6d15c81abe80fbc5e13715f385f8a978b6482153ba7cec90474f46b6886ebf` |
| states-master | 6 | `b8c91c53fff7908b583e3690463b7effdbab5394ed9d327133e8c755d3234223` |
| states-api | 1 | `2395d7afcf495d57355e29724dc18f10fb01b10158e7e10992e3b4873f5a03fe` |
| states-api | 2 | `11f8fd32cf2e1917fcbc35ea783d4f6f46e6df380bef0165ee054c636da37db1` |
| states-api | 3 | `0385cf078edb08d33b9029d57b67bf2d6055a6bbef25d102ef84327700ea2271` |
| states-api | 4 | `5436b2b4eb4947f63d84e03931b6030fd296510ca38beb398ce168a140ee52b8` |
| states-api | 5 | `7547aea0698fd6a727fe01c605aec786ef768d02eee433372be30843e707ba44` |
| states-api | 6 | `100f5727ce3e5e0e0cde9218293a9a96b5d7bd7346bbfc9e760110bc1096afad` |
| states-api | 7 | `21b4aaa6465e8c038b67613a7d59733d4e06b8fea8172c1ba06d98f55e782ed4` |
| states-api | 8 | `4778b66ab2e8bc98acc1502c1988db12fa425ebdba2caebe7e6a0fa0ff427221` |
| states-api | 9 | `fa29e6b6d508b4adf2fbee147d4cdd2e0520800e9974aba97afacde7dd386ed5` |
| states-api | 10 | `67f990428b9dbca4718c2f98282eab7cbd9bb777971adb9c3614260407765e8c` |
