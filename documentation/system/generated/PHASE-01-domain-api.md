<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# Phase 01 - Domain and API

## Purpose

Build the server contract first so both clients consume one stable model.

## Required decisions

- Entity fields, normalized values, nullability, relationships, uniqueness, and archive semantics.
- Separate list, detail, lookup, relation, and mutation contracts where their shapes differ.
- One-based API paging, maximum page size, default status, allowed sort columns, and deterministic tie-break.
- Search field and operator allow-lists, including negative-search null behavior.
- Stable validation, not-found, conflict, in-use, and authorization responses.
- Commit order for audit, persistence, background scheduling, notification, and realtime publication.

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
- [ ] Bulk actions state limits, duplicate-ID behavior, atomicity, and idempotency.
- [ ] Every externally visible error has a stable code and localized message.
- [ ] Tests cover default paging, search, sort, status, duplicates, archive guards, restore, and bulk behavior.

## Approved references

- **Countries cross-platform master review:** `../project/COUNTRIES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6
- **Countries API implementation profile:** `../api/Countries_API_Implementation_Profile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| master | 3 | `b0ae30454b32e1209cd9b74f1bc82d45e58ae969a61381a25c64c86db7b09dfc` |
| master | 4 | `981aca037f6288ddcd99834cf04d08cd99f65850ed34036f2f44374e894e3104` |
| master | 6 | `e671cfed0bfb63b0063c4f83c86be605190925f9dc7e6b1ef6e335c26fb89c54` |
| api | 1 | `32d383dbea72903c12b0dd2d1b90c2ba6a10d6621ed91ae24f466af2563cd9c7` |
| api | 2 | `afe1864abf7934444f9ea9b8b23456c10205bf6f59cdf60460c07fd71a5a5e8c` |
| api | 3 | `1ed086d9c6342d4b59513fe93963fa4f837d0d896e5cfb9afa308ca8abebcecb` |
| api | 4 | `8b127505d19c53adf6aa841529e5065220d1158e7679526b0bdd12fb28ed7ac7` |
| api | 5 | `02e43688e2b00c35e8790993ecceb3bbc3346875252da1d5f903717c53a38529` |
| api | 6 | `6f3fb6d8e004e407e57bb8e4c51596bd6d2de6377f7867c99b453ff882c3bc68` |
| api | 7 | `1ab9fa036b11c40090cb0b49890916d71ab6eedaf0ee99815a641c4fcd123237` |
| api | 8 | `19ba24881ed075978da2d89d9f5d6ac913ca8289d14d251464edfd93ab1e8c12` |
| api | 9 | `d573f11dbd27c997e0f25cadcdbfb27a171809b7cd3ac088a355154f6c9c0105` |
| api | 10 | `6267cad08ac31db9d3fefbf5abda40d64d5be3e91d08b0eb42495ebd14b40aba` |
