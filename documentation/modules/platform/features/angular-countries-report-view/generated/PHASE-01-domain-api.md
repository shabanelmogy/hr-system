<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Countries managed report integration Phase 01 - Domain and API

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

- **Countries managed report integration cross-platform master review:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-review.md` sections 3, 4, 6
- **Countries managed report integration API implementation profile:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-report-view-master | 3 | `dac0aafd01072bcd072b7fb9173bd520856278ceda3129d7325f20ec8a47b325` |
| angular-countries-report-view-master | 4 | `3b38fdb0f0c035d49d625c0ef5925ea5dab689790a0e902b6d14455d457ffc2e` |
| angular-countries-report-view-master | 6 | `97a7a27cdc275344b63b9f89e0a89f42c54f4857f207cb9029e9302d425ae8fc` |
| angular-countries-report-view-api | 1 | `387934e62c1e0197f4894fc3b143548ac4b5776cbffe763057b6aa3de8a68e59` |
| angular-countries-report-view-api | 2 | `1abd6291624d06e3d1f34333891ca796a9e00f8aa20cacadf888cd301df5a66b` |
| angular-countries-report-view-api | 3 | `dac0aafd01072bcd072b7fb9173bd520856278ceda3129d7325f20ec8a47b325` |
| angular-countries-report-view-api | 4 | `3b38fdb0f0c035d49d625c0ef5925ea5dab689790a0e902b6d14455d457ffc2e` |
| angular-countries-report-view-api | 5 | `43b959cae6bb10e1d9bcf2e172b2478bedb17a95f07dcf801fdebabb55016a2b` |
| angular-countries-report-view-api | 6 | `97a7a27cdc275344b63b9f89e0a89f42c54f4857f207cb9029e9302d425ae8fc` |
| angular-countries-report-view-api | 7 | `bdc28a44e43d6e2dcd0c2e5e7701abcf746b167b32fc8e7a63d34a0c9d7c1ef8` |
| angular-countries-report-view-api | 8 | `7b60972b45ea2acdcdca1d0674b119b26fa40d043d89416c6df3796537de9fc8` |
| angular-countries-report-view-api | 9 | `0215aed4368565042ad4967e981f04b00180df8b9b530c8e779be74fb01b3b98` |
| angular-countries-report-view-api | 10 | `13d60bdce102af4d3de471b1c12d188b22f6defca177537ecb29b0a236150bca` |
