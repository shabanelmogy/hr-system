<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Company UI localization Phase 01 - Domain and API

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

- **Company UI localization cross-platform master review:** `../modules/platform/features/company-ui-localization/company-ui-localization-review.md` sections 3, 4, 6
- **Company UI localization API implementation profile:** `../modules/platform/features/company-ui-localization/company-ui-localization-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-ui-localization-master | 3 | `ae522a981014d3db9c430fa6065b685a3e9ea8941f671ff038f99100e42c7daf` |
| company-ui-localization-master | 4 | `4bd147662b54d98c579aed8cff606deb90ad3a173bd56299833a23743eddfbb9` |
| company-ui-localization-master | 6 | `943b732392e0c38800ae8e34732c3eba94fae4f111c24dd29ffa5bb65826cf61` |
| company-ui-localization-api | 1 | `49b818f2f04e8a7633267cb7b4775d22a8cc8b3be175a0184a1779eceaaa253e` |
| company-ui-localization-api | 2 | `940b5a65972b708080a28510d0bf604283423a7c06f370d6855c75ad083b442d` |
| company-ui-localization-api | 3 | `0917defcf76338cb9811ef5eb58c11843732dfd9ac46dbc331a4d84428c8b074` |
| company-ui-localization-api | 4 | `a0c110de6f5d056ee9e9ac11a6c0f82988789b83872fa209d10d45887070bbed` |
| company-ui-localization-api | 5 | `8a2f5f04e1cc92792c9c18c2edd4510c9f749176b1d4ae02b3aaefde07735d97` |
| company-ui-localization-api | 6 | `bb779b766a06cc846202269f5787db5e66022d527440cc4feb10f9aa304996d9` |
| company-ui-localization-api | 7 | `7ca5a25d8744d014f3d1658bb9203c881b8304fe465919112dc969fe4b2fe247` |
| company-ui-localization-api | 8 | `a555533fd36049b26f9ec99541ffff190ce95edf577fe6e99f5864a3893ea3e1` |
| company-ui-localization-api | 9 | `ee95a26639431f522358b844f6b31749e1572743b616d7472661caee8fbe0738` |
| company-ui-localization-api | 10 | `b5f6e14b9b81bf8ac113a69cab0f7b7f88e7eb976b9e25abb54acb9638961531` |
