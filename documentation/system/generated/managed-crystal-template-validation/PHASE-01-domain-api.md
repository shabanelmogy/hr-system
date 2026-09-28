<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Managed Crystal Template Validation Phase 01 - Domain and API

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

- **Managed Crystal Template Validation cross-platform master review:** `../project/MANAGED_CRYSTAL_TEMPLATE_VALIDATION_FEATURE_FULL_REVIEW.md` sections 3, 4, 6
- **Managed Crystal Template Validation API implementation profile:** `../api/ManagedCrystalTemplateValidation_API_Implementation_Profile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-template-validation-master | 3 | `d5750ec782337abb998b935688fe28befe372bebda9f0fc1bdf298453539f145` |
| managed-crystal-template-validation-master | 4 | `ad565be28727a67b728477a4afa8f58cf6868f6ecd2f9bf5f7b59400f43d8141` |
| managed-crystal-template-validation-master | 6 | `fa456baddc6f73079e396b08f3b2fa608267e66d8d1d2f71036708a8182094ee` |
| managed-crystal-template-validation-api | 1 | `f328b7348ab2e8af52b3c6089a8044dcb00bf12b87e1956d906e8d11170c7af8` |
| managed-crystal-template-validation-api | 2 | `7e6a34cf64b17596059552588b7bf9a9f658fd9346eecb0170855b8fb3b1dd8d` |
| managed-crystal-template-validation-api | 3 | `a5f326ad1628c4dcd974c8f7458badfecdfe2478146c0c8624837a24fd7c0c89` |
| managed-crystal-template-validation-api | 4 | `6b6306a5d45a4edec40d56d75c2a5f34e35ade740be821aaf76326559d6d012e` |
| managed-crystal-template-validation-api | 5 | `f9ac1382c643191d333710927ae663a6a5eec5a0881ef6c08058052872a91ece` |
| managed-crystal-template-validation-api | 6 | `3654fde2d7e5594bb94be6e7371e87297b0bbddcff83ed364cd127ef3f5d7878` |
| managed-crystal-template-validation-api | 7 | `3cbe9889948792652c7be8b39a13496cb278a5eecb14326ad573f12ac9350610` |
| managed-crystal-template-validation-api | 8 | `d6a3c1c59c1b9eeaf3bc531392ef5f1b7044e855ee5825037e34c4ec110f705c` |
| managed-crystal-template-validation-api | 9 | `0b7d25abfe95224d05a59bc890b6e52afe7d0277e27fbbaf993b8c5c79bdec51` |
| managed-crystal-template-validation-api | 10 | `16b287f37a94892dd07d906d9770665db062dbf49be1da57f5104f5f5aec38a1` |
