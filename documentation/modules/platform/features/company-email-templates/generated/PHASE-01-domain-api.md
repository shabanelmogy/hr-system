<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Company email templates Phase 01 - Domain and API

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

- **Company email templates cross-platform master review:** `../modules/platform/features/company-email-templates/company-email-templates-review.md` sections 3, 4, 6
- **Company email templates API implementation profile:** `../modules/platform/features/company-email-templates/company-email-templates-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-email-templates-master | 3 | `8cfceb41ccd21b6f52a9dbaa638bff99dadf8a412a1db8855124cfa4b36f337e` |
| company-email-templates-master | 4 | `ecf324faf8fb27d4110c34672c429c9f8664b54d71c0fe07f24641366780567f` |
| company-email-templates-master | 6 | `8ed77bb6949b5a4989589bba630b031ff6adc4d6a87ddc0b4758137c1021b5b0` |
| company-email-templates-api | 1 | `4ed2b04e636f0249206e9cf9117415982d4bbd24b2939b7c21ecdb8664b89b07` |
| company-email-templates-api | 2 | `1435fcad7c5a8a808d1a35d1f43dcdac0f7310dcff82256a2423b02bbe013ab4` |
| company-email-templates-api | 3 | `0331f2b850060caf0cd9826a0541919cce74c2633f00989405d0920e771591e0` |
| company-email-templates-api | 4 | `14355f748f213422231bfc17e0354c8bf7576b0a6f47d28b29412fc762313344` |
| company-email-templates-api | 5 | `a006b58aebd7a2e45739286a6b865627c21130d1ab95279faafeff492ef934b6` |
| company-email-templates-api | 6 | `f6af26e5d3e2d2baf1ac263fb20c657d56c35f05c97cc67316c9e63142405a05` |
| company-email-templates-api | 7 | `95a39402ae66c71e999ea6de19bf53ef6bca82840a2682b8292a1bad7bfdcf9a` |
| company-email-templates-api | 8 | `0800b92f0acdcd92e1f39b6b07efc3da076eb900cd5e2d17e53e1a8a045ab88e` |
| company-email-templates-api | 9 | `89d30873984db963644035cfd6e1ffe483a42607205802b7f582960759fd4590` |
| company-email-templates-api | 10 | `f96971b24f29c3303b7c8270d55f52d6ac4124567f0a7fcc359daf39688e313f` |
