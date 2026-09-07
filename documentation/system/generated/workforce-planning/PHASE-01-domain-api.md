<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Workforce Planning Phase 01 - Domain and API

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

- **Workforce Planning cross-platform master review:** `../project/WORKFORCE_PLANNING_FEATURE_FULL_REVIEW.md` sections 3, 4, 6
- **Workforce Planning API implementation profile:** `../api/WorkforcePlanning_API_Implementation_Profile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| workforce-planning-master | 3 | `8a6e6f69a054988c340491b10518046b54afe615727bf4fc084bb455b37e868b` |
| workforce-planning-master | 4 | `159708f556ff4c7fd6abe33b8953d5e9f2024ef3b688fb8fa310e5253c622625` |
| workforce-planning-master | 6 | `aca3820d1e8cceabd1d783a1fec9e1265ae8fe95ea335ed7d5469e4e39f43829` |
| workforce-planning-api | 1 | `d0f07c6666739dcc646fc29b2293941449978547bbabb2fcd8dd4f210491afed` |
| workforce-planning-api | 2 | `3670c2eda1263e230a386f1193b560dc7a534e9cbb67ef712c7479b29a80db17` |
| workforce-planning-api | 3 | `9162fb3149b4784a16424bbe5a9efdb964e58055c82fe43ddfadda2c9dce6238` |
| workforce-planning-api | 4 | `c37c03c83909d9414e8beccb2d3b586e1664a373a2db3f52a09f6198d7d99b8d` |
| workforce-planning-api | 5 | `a09a6ba753e8ff3f46a16e328e2a6e6c1bd00d001fe269a2d53d3dc36ee9ae1a` |
| workforce-planning-api | 6 | `0263735c47f76a4aa79bcecd19c8d5a1a80cd105faafa759c5066f4c8df40a9b` |
| workforce-planning-api | 7 | `14954033c5dbb4f9d1c0d65ed548e0a1cded24d456f26facde4fbfb7b6c51d67` |
| workforce-planning-api | 8 | `c704b6af82f8445876dfd1f1ab587e91b5c22c45d4c7de226d0f0796368fb47a` |
| workforce-planning-api | 9 | `68468926495a461460f5035398f8c1157318ac4dda103d249f2b2a9c58926792` |
| workforce-planning-api | 10 | `2e1212fe37e33e9c36a2ef3e2065386885f2b4de94610164d896694b735a5774` |
