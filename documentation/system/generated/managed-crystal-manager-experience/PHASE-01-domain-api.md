<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Managed Crystal Report Manager Experience Phase 01 - Domain and API

## Purpose

Build the server contract first so both clients consume one stable model.

Execution reference: `documentation/api/API_FEATURE_DEVELOPMENT_WORKFLOW.md`.
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

- **Managed Crystal Report Manager Experience cross-platform master review:** `../project/MANAGED_CRYSTAL_MANAGER_EXPERIENCE_FEATURE_FULL_REVIEW.md` sections 3, 4, 6
- **Managed Crystal Report Manager Experience API implementation profile:** `../api/ManagedCrystalManagerExperience_API_Implementation_Profile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-manager-experience-master | 3 | `95b2877cf63539d97f8812e17338a1f02b17431a802f48f6652646b80a9d1675` |
| managed-crystal-manager-experience-master | 4 | `6155835514ebb01ebdfce1431aa47209f3799dcdf826d944233756fd85a5bdf1` |
| managed-crystal-manager-experience-master | 6 | `11acfb50331a9258f4cb84c91af1c2919d9caddfde1af01db9b0e1de4445311d` |
| managed-crystal-manager-experience-api | 1 | `6840a63612be69e6e2fc2c30c9ee314fb819ab9c4200a3fc254b4b3ffd799f95` |
| managed-crystal-manager-experience-api | 2 | `7be40246115e38a96c3450734df584a4c4ebe31adf7bff03ec856ca5554cd0a7` |
| managed-crystal-manager-experience-api | 3 | `54a0256a8a66c6a7e8e66a90b893d095d16551042207c7551381dbe42798ced3` |
| managed-crystal-manager-experience-api | 4 | `0dbafc1d4b6b5f7a8962d6fc1960ac4eaddd4c22be4a3790782e88c9ac89a535` |
| managed-crystal-manager-experience-api | 5 | `2e80209bb9a2a46fdb33a9d119ec3604b2b9b6716f1b7c79e04fa4b90a371c33` |
| managed-crystal-manager-experience-api | 6 | `bd5481e78db6cb51f758b078be897c86a762cb69c3e22965546eaff97f5a37ba` |
| managed-crystal-manager-experience-api | 7 | `dc83b76a43780060c3fc24ff1dd82764a312b9f36024223385db7f9a1e3a173c` |
| managed-crystal-manager-experience-api | 8 | `dfe2d1e952c76df4b242c1b5540f1f202e05a2e66ac20a135f5b2baed6d4f991` |
| managed-crystal-manager-experience-api | 9 | `94b91385cc20a0468c42bd7bf47471c6638f34c7a09689e1df5247db93f8a764` |
| managed-crystal-manager-experience-api | 10 | `0ab127d92eedad1d1ff51c9c541f6b29fa5c2a243e44b342e16621429344f2c4` |
