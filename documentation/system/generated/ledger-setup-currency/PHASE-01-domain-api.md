<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Ledger Setup Currency Phase 01 - Domain and API

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

- **Ledger Setup Currency cross-platform master review:** `../project/LEDGER_SETUP_CURRENCY_FEATURE_FULL_REVIEW.md` sections 3, 4, 6
- **Ledger Setup Currency API implementation profile:** `../api/LedgerSetupCurrency_API_Implementation_Profile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| ledger-setup-currency-master | 3 | `62b8150faf9422f607633c4841d52d5dc644a9a4c3502164e41572d650d6f9db` |
| ledger-setup-currency-master | 4 | `4ed34b720eff68b1e8efaa1b9a8901f2adf75224a463590905ce817d806a9b94` |
| ledger-setup-currency-master | 6 | `dbc146242b859fa8b147c7cb15b5c30e6a51b45d89c43fa7c08ee1df7b0d5e4a` |
| ledger-setup-currency-api | 1 | `1e15069827ad074d82fd6e57d2b805aefa2eee0833aeb45962d8a9744275372c` |
| ledger-setup-currency-api | 2 | `e773ae96ad481aa8a4ddbf60a549616753776df6f5017fe703d4d86e59fba32d` |
| ledger-setup-currency-api | 3 | `3de12d2a1c1bb7a9b8e9bdbd07ba8d25408d609adddb08176678d5f6c47f2086` |
| ledger-setup-currency-api | 4 | `33db86c5b7c8016634ff305b284623f7970274e981dbc331e1aec46ac1d1895d` |
| ledger-setup-currency-api | 5 | `b2e89f223b43ba3805cfb59c1abc73d1c1df0e8529c1050fe4ae860e7d330151` |
| ledger-setup-currency-api | 6 | `51b2eaae1b7f4d980663df2cc3bf3fa4a4bf76c87bea22770639d84c8cfeb236` |
| ledger-setup-currency-api | 7 | `59076dbce64b783f44dd30df6da4b67e5d0c311fef94f5146637db0e3aef2e28` |
| ledger-setup-currency-api | 8 | `1369f1ffe58bd47ec8f398ca6f17e0ea5c6e99f731de75b2d9f857b5f77f772b` |
| ledger-setup-currency-api | 9 | `12bf887a00d1c51b4c717b7615d0cc85b2f99796835dc8e357b93d26d60717cf` |
| ledger-setup-currency-api | 10 | `01bbb185825055c46bcab3251bc15df822bd15ca88bbef31094caa68e25bbbb5` |
