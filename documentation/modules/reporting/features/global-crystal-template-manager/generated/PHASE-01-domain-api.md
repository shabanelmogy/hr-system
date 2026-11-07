<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Global Crystal Template Manager phase 01 domain api

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

- **Global Crystal Template Manager cross-platform master review:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-review.md` sections 3, 4, 6, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39
- **Global Crystal Template Manager API implementation profile:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-api.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| global-crystal-template-manager-master | 3 | `2c1bb6b95157d0c52e058e7a5a75b2bddf7135ebfeb8081406aa1ef5df3b14e8` |
| global-crystal-template-manager-master | 4 | `751d2ce4c155b3b05c7d102d2669ca392bc0903ee3f5fa24b7aaf1eb74cb9958` |
| global-crystal-template-manager-master | 6 | `1273a47a237eb1ffa6534fbed0a57ffd8dbeb1a1d48fed9b0c7514bf49d9c6ca` |
| global-crystal-template-manager-master | 20 | `7cce7bcd793c79160e4c86a3b8d08c750ebc39b2f2224474a73f858d671bfc68` |
| global-crystal-template-manager-master | 21 | `d4c3cb230cc1b91ef63280157daf31ff73299f7ffe734e3457792977b7578109` |
| global-crystal-template-manager-master | 22 | `c1329e689ea0d46a23116d9ab45527c3c2fd6ec098ec64b2c5bb5d5bc7395c92` |
| global-crystal-template-manager-master | 23 | `a0ac15537e588fcdbcfdf338c870fca7ef514fe52b0b053f26bd8bcb2ba47373` |
| global-crystal-template-manager-master | 24 | `b724845af1efbcaf024345619e7449535d263c9dc68dea5f8a0e5c2dfed4b60a` |
| global-crystal-template-manager-master | 25 | `df4a8eb856067b53c0c26324595e31d4506fbaf1b86c0ecf54cfa5213b8ddc46` |
| global-crystal-template-manager-master | 26 | `9949c0e134b5e14dfd755307712279dfb2ae8806f79391e37530806d4a12d7a4` |
| global-crystal-template-manager-master | 27 | `3e6d30311227985bc3662bc4bc045818bd198fd0105aa171c7da6a41238ed052` |
| global-crystal-template-manager-master | 28 | `9bd9610bc1fb20fff74e2df956764b35fe58358d36ecaa5f2cc5c90b6809acd2` |
| global-crystal-template-manager-master | 29 | `735553a184d870e5b0f7b517fee31a34c12de91596006e0d4d47bb2ebe0280df` |
| global-crystal-template-manager-master | 30 | `033b206113209505f6eb8847c219c212d7c6fc9119dc68b8bcd9ef8377ea104a` |
| global-crystal-template-manager-master | 31 | `6077f118da9d211e874f1c3679de7107b1f12c9fa38e1bbcdcc76a29ce9394c5` |
| global-crystal-template-manager-master | 32 | `0b534fb5056d3e74dc4cbcbcf4682b56a86fe63c68c36052dea7dc09cfd64fda` |
| global-crystal-template-manager-master | 33 | `f9250743d2d7f5347d74a85f9316c451638e60acaa9973d7c9938562fec4987e` |
| global-crystal-template-manager-master | 34 | `1fc4b56190cc7ef47e36f3cae06d48c575dffd33b85b795788ee2b5908a1c6b7` |
| global-crystal-template-manager-master | 35 | `3fba7e7f4ff00b4363792c940bfc919c6631536cb5520560127f5688b8692192` |
| global-crystal-template-manager-master | 36 | `8796d3e9f52ea1ca5aabf0a8dffd4e65e53673153ec4fcf6ac98a462813bbd87` |
| global-crystal-template-manager-master | 37 | `a79c36efe60ac284e27acfb5c9a980a61479b5d2a9449629c0e97d11236d4e2f` |
| global-crystal-template-manager-master | 38 | `d02b2b160aff790881be2aead2faed3e8103596027f40fc5d4e59b0c0cc2321e` |
| global-crystal-template-manager-master | 39 | `a2e564da5d402ad1de9ab60dca78ac95acd385c2912eb989a68de38d35c0b739` |
| global-crystal-template-manager-api | 1 | `63b64f1c04c4d64fcd8c0948e5ba126ea382892c8d5125d9916354a72b012d37` |
| global-crystal-template-manager-api | 2 | `f68735ee9eb09dd9812031f6fe2aac12dad41343cdb9a545d36c14eb4a1ba7ef` |
| global-crystal-template-manager-api | 3 | `f939972d29805461ac9d62b07e23530a02c42edb990ac47f0d677d6ee9b94bcf` |
| global-crystal-template-manager-api | 4 | `bb46587c2cf222cefacd0305bb0570f8242eee98343067c5f6b3fffa4d0cad6b` |
| global-crystal-template-manager-api | 5 | `2bbb9b5b026b5e3e52878743e2fcf318d49ab11c4c58ef114545b68275c9025e` |
| global-crystal-template-manager-api | 6 | `9b356b709d4d757975598526564240b23711767127b699ee905a50827e9ebef4` |
| global-crystal-template-manager-api | 7 | `7da68d32f04c8dbbe01bf8f48735118ba6069d8199e13ab804315366297b5b5d` |
| global-crystal-template-manager-api | 8 | `5dd0aa68eb109a053078ffa2c9bc6547b32ca8dd0cd625efcace1e99a628cbcb` |
| global-crystal-template-manager-api | 9 | `54fb944c835fa2f1a6f39945b9e482bbaff9b0946ae17f1af5da0401d128864e` |
| global-crystal-template-manager-api | 10 | `20788af211baf295318e1079031ad92497e5d5bdb01560d787c226481c93ddef` |
| global-crystal-template-manager-api | 20 | `7cce7bcd793c79160e4c86a3b8d08c750ebc39b2f2224474a73f858d671bfc68` |
| global-crystal-template-manager-api | 22 | `c1329e689ea0d46a23116d9ab45527c3c2fd6ec098ec64b2c5bb5d5bc7395c92` |
| global-crystal-template-manager-api | 23 | `a0ac15537e588fcdbcfdf338c870fca7ef514fe52b0b053f26bd8bcb2ba47373` |
| global-crystal-template-manager-api | 24 | `b724845af1efbcaf024345619e7449535d263c9dc68dea5f8a0e5c2dfed4b60a` |
| global-crystal-template-manager-api | 25 | `df4a8eb856067b53c0c26324595e31d4506fbaf1b86c0ecf54cfa5213b8ddc46` |
| global-crystal-template-manager-api | 26 | `9949c0e134b5e14dfd755307712279dfb2ae8806f79391e37530806d4a12d7a4` |
| global-crystal-template-manager-api | 27 | `3e6d30311227985bc3662bc4bc045818bd198fd0105aa171c7da6a41238ed052` |
| global-crystal-template-manager-api | 28 | `9bd9610bc1fb20fff74e2df956764b35fe58358d36ecaa5f2cc5c90b6809acd2` |
| global-crystal-template-manager-api | 29 | `735553a184d870e5b0f7b517fee31a34c12de91596006e0d4d47bb2ebe0280df` |
| global-crystal-template-manager-api | 30 | `033b206113209505f6eb8847c219c212d7c6fc9119dc68b8bcd9ef8377ea104a` |
| global-crystal-template-manager-api | 31 | `6077f118da9d211e874f1c3679de7107b1f12c9fa38e1bbcdcc76a29ce9394c5` |
| global-crystal-template-manager-api | 32 | `60c8f8138c4fb382544bd09c7aa53e10a4b2ab870f69849e05328d93bb0daf6a` |
| global-crystal-template-manager-api | 33 | `f9250743d2d7f5347d74a85f9316c451638e60acaa9973d7c9938562fec4987e` |
| global-crystal-template-manager-api | 34 | `cb19528496f5deb4c9a675d82089eb1c94c4b23b9ae487b99626cd4dcfbb26ab` |
| global-crystal-template-manager-api | 35 | `f2dff9f3409cda949cd902cdb91d0308e1442a2e764d7c2e555f3649d3a466c1` |
| global-crystal-template-manager-api | 36 | `8796d3e9f52ea1ca5aabf0a8dffd4e65e53673153ec4fcf6ac98a462813bbd87` |
| global-crystal-template-manager-api | 37 | `49f902cc782b8a5c3124233b07bf12a82b4ff1a174a5d1a2bee8519747ed861b` |
| global-crystal-template-manager-api | 38 | `b78bd8ddfc6fcbe593dc815ac4c3849fafeb0eae896199ce52568de6c8b9ab46` |
| global-crystal-template-manager-api | 39 | `b91369d1b82101ed5dd44eb90c4e4a57483bcc094721ea18e9af66c3d9c3fcfa` |
