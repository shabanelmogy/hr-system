<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-01-domain-api.template.md -->

# States Phase 01 - Domain and API

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

- **States cross-platform master review:** `../project/STATES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6
- **States API implementation profile:** `../api/States_API_Implementation_Profile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| states-master | 3 | `1bcee45daae927bacec3682c14a6330114ca29ffbcf6b489376cccf337a7d38f` |
| states-master | 4 | `9d784c317c702d41f1d9282b7d153ea617fab527d8e80ef7222e65f18cd52fb0` |
| states-master | 6 | `b8c91c53fff7908b583e3690463b7effdbab5394ed9d327133e8c755d3234223` |
| states-api | 1 | `15d834bcb75fb59cc980cd3b79c748f1be10cae3708fbc8f16bb2cf5f1fe05fd` |
| states-api | 2 | `a0d81d59b393752b1da9b83b766b01834e0146568e7bbacffd168ba66634652f` |
| states-api | 3 | `48a7b9f439ef0ded4904ee351254b2f8d392224ca5598f72fd290f05cd3b3528` |
| states-api | 4 | `5436b2b4eb4947f63d84e03931b6030fd296510ca38beb398ce168a140ee52b8` |
| states-api | 5 | `7a24944b7ecfa6276e2f6fd1201c54f3ca488e400930d2408f665f630035709f` |
| states-api | 6 | `97e7703fbf9f0fa2eee2f1927c01c3e8c47dc983c6169ffc42bc09df2fd4853e` |
| states-api | 7 | `79ef819ddb68cb8382bf2c5f313131548be7b4a66ed3ab6e53777108f1093f66` |
| states-api | 8 | `5f502b1906084a55b3bbff646f16611cc3c88e03b432a210d739a729d0eca2aa` |
| states-api | 9 | `19ad89693b2398543aff1b54378da61520f0171ab8d1e1e67f8b7627de4ff7a1` |
| states-api | 10 | `86e2ea950a4ca4301825133cc4e23a5fb901d665a9105e81b22821a9080ef4d5` |
