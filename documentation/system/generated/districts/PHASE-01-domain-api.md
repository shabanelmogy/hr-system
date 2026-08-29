<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Districts Phase 01 - Domain and API

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

- **Districts cross-platform master review:** `../project/DISTRICTS_FEATURE_FULL_REVIEW.md` sections 3, 4, 6
- **Districts API implementation profile:** `../api/Districts_API_Implementation_Profile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| districts-master | 3 | `7db1a7d82da3179a850933bc4c5ca70c2c552128be8b21b17a84b73cf938f939` |
| districts-master | 4 | `73edb563ff159ccd70caafab0275db68887f98c3c3f22ecdfaaea7ee41b4fb2e` |
| districts-master | 6 | `bc842f66c8ecdd4133ee9a86a1901d41047bc8cc48ec01e8a302ca6ab510da07` |
| districts-api | 1 | `22b3bbfddbed6d5048acb0224ba4b08ff7d1e5f94af607e8dde95b758b0a4c9b` |
| districts-api | 2 | `acbcd927908b4fa5a19ff18d896f39795c0dc4718aaa3f432142a7992f979e1d` |
| districts-api | 3 | `01443e47ae5fa805afd6d2edc3e345b5610267819a78871360abf4367502b367` |
| districts-api | 4 | `fc13063d8cc49f699f637ffa96865c841c4714251ecd728b8209172124fb7148` |
| districts-api | 5 | `817904cf7b037c0d4815e7389245629f1db4cbc6f435ac68ea4696789def8ff7` |
| districts-api | 6 | `7cd07281bc0eacece3dce2b4cf4f612c5da3026182fe36b53aa11c23b157269e` |
| districts-api | 7 | `0aae75ef226e7c43d3132c55e1a824affb1f208f419cf029abd4cef948fcf8f1` |
| districts-api | 8 | `808bf1aa73ef33b6517d65ccc0aa7d5595474cb438f80fb39f8338791b3d797e` |
| districts-api | 9 | `0967a504ad230259d1b0ad0a4bf07bb0f0ba762151ccc5c045cc3fdcca5e7c74` |
| districts-api | 10 | `0d23b350dbc4a7e62be4d8f701af945b5d9c43e5a2f852035b2cf9f909ae62a1` |
