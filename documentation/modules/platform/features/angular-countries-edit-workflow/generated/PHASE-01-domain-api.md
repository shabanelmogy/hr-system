<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Countries create and edit workflow Phase 01 - Domain and API

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

- **Countries create and edit workflow cross-platform master review:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-review.md` sections 3, 4, 6
- **Countries create and edit workflow API implementation profile:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-edit-workflow-master | 3 | `db3a081602bb5973134e4ce07713f62205089a3eb34649c6e76848d34e252309` |
| angular-countries-edit-workflow-master | 4 | `191dd68f7e834b4f6033d137a3fa9e59fd2a4ca303758d4fbe493e9159690254` |
| angular-countries-edit-workflow-master | 6 | `181613fc61072107ad666952c73167e3fa398b359d944f7e58d217082463aca3` |
| angular-countries-edit-workflow-api | 1 | `d46506912b9934a2c6ba023b994989f84386796cc2df6f50882477c3ed8714ce` |
| angular-countries-edit-workflow-api | 2 | `69e135396446c50c716b2a6a02dcf3c44a0c458a22831f62074b0f7bd160cc5b` |
| angular-countries-edit-workflow-api | 3 | `db3a081602bb5973134e4ce07713f62205089a3eb34649c6e76848d34e252309` |
| angular-countries-edit-workflow-api | 4 | `191dd68f7e834b4f6033d137a3fa9e59fd2a4ca303758d4fbe493e9159690254` |
| angular-countries-edit-workflow-api | 5 | `9e4c812bc1ac25ecc365f17515aaaceb899f41acf26ee693b6411da8de5c18dc` |
| angular-countries-edit-workflow-api | 6 | `181613fc61072107ad666952c73167e3fa398b359d944f7e58d217082463aca3` |
| angular-countries-edit-workflow-api | 7 | `75fe6c506ec73b0cbe3140da9c7cd32ad63a48d247ab8865c78c76e10961c1bf` |
| angular-countries-edit-workflow-api | 8 | `ff276aa95fc18c307c2643d7f5b234fd8cc7b61a7a3028ff07d0e9d8ed3a9710` |
| angular-countries-edit-workflow-api | 9 | `b55df01be12c2ea1f2e5a24818e4fa75a7f9a9d56308f87afe33f278801d5e3f` |
| angular-countries-edit-workflow-api | 10 | `564a8021c73eace16eb080013f1642aeaa13633e4c3a21f7121220904a608d2a` |
