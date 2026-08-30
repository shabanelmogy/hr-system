<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Company Geographic Scope Phase 01 - Domain and API

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

- **Company Geographic Scope cross-platform master review:** `../project/COMPANY_GEOGRAPHIC_SCOPE_FEATURE_FULL_REVIEW.md` sections 3, 4, 6
- **Company Geographic Scope API implementation profile:** `../api/CompanyGeographicScope_API_Implementation_Profile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-geographic-scope-master | 3 | `9ec15c72949a18d28967bf33b8be561db54b6bbe9511861f83fce9b7bbb4f182` |
| company-geographic-scope-master | 4 | `8185c0aac290bcb1ea4cb2e37b929a12ecd0992abfd64e7ca399982ee2053de1` |
| company-geographic-scope-master | 6 | `9af33779eb8e399a26aa1fbde2585ba40dcd0fad4f6223030372c15c0aec6c20` |
| company-geographic-scope-api | 1 | `36c11f614a057bd97744bb17b06312435a14bead1f5983cc2b69c18750a4b8f5` |
| company-geographic-scope-api | 2 | `91c5013c7ab8ad3c062b5f503b2b8c53451ed64ca4ae45a49e6211c05bbe53c8` |
| company-geographic-scope-api | 3 | `baadd3e6f008d9e4228c16c7d037be7eff83f71e7db96439ff239ca80fb0e5cc` |
| company-geographic-scope-api | 4 | `64117b4d243b4eb684ac7e6403e30060d0bfe54ba24a16583b694348d2d52fd2` |
| company-geographic-scope-api | 5 | `0427dfe1b48c1c2124f6074d92bad806f29ba090f0fb020b62da79cfb05155b0` |
| company-geographic-scope-api | 6 | `4c7325830581e9f774857e293389ab0ef21a42011c58fb9c04dde46d4826e658` |
| company-geographic-scope-api | 7 | `8b064dc66d590bb7728278089f799c6361489d43850fa7962ebd821d8dee4ab6` |
| company-geographic-scope-api | 8 | `bfa505287d661d283b0aa02f52e340f7d6fd52b22e9dfa42ad19350143811147` |
| company-geographic-scope-api | 9 | `4a37002841d902cf3ae667530b071adccedf2d9b0a68a674d1c275bdd5d387e5` |
| company-geographic-scope-api | 10 | `31ff1672a8154ab2c4f57b43f1935a3136a633e592fd72f384299835665e24b2` |
