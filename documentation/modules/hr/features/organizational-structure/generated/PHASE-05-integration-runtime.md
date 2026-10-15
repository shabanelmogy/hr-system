<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Organizational Structure Phase 05 - Integration and Runtime

## Purpose

Prove the feature is connected to the running system, not merely implemented in isolated files.

## Integration matrix

Verify all applicable registrations:

- API endpoint versioning, authentication, tenant membership, permissions, dependency injection, validation scan, mapping scan, database context, localization, Hangfire, notification, and realtime.
- Web route, API proxy path, endpoint registry, route access, navigation, permissions, query keys, realtime query registry, translations, report route, and import dependencies.
- Mobile route file, typed route constant, route manifest, navigation, permissions, endpoint client, query keys, realtime registry, notification deep-link mapping, translations, report file handling, and device-safe layout.

## Runtime evidence

- [ ] API request and response samples match documented field names and paging metadata.
- [ ] Browser and mobile requests serialize the same shared filters and sort tokens.
- [ ] Every Required Import client sends the documented exact request body and
      resolves dependency lookups through an authorized registered endpoint.
- [ ] Import success uses the documented plural audit/notification/realtime action
      and refreshes normal feature caches; conflict and network paths remain retryable as specified.
- [ ] A successful mutation refreshes all open clients through their normal cache/realtime path.
- [ ] Notification action URLs land on authorized routes in both clients.
- [ ] Unauthorized, read-only, validation, not-found, conflict, and network failures render safely.
- [ ] Production build configuration does not rely on local-only URLs or secrets.
- [ ] Localization and RTL are tested in actual runtime layouts.

Capture configuration and registration evidence separately from behavior tests.
A file existing in the feature folder does not prove its route, DI, permission,
realtime, notification, localization, report, or Import integration is reachable.

## Approved references

- **Organizational Structure cross-platform master review:** `../modules/hr/features/organizational-structure/organizational-structure-review.md` sections 4, 5, 6, 7, 9
- **Organizational Structure API implementation profile:** `../modules/hr/features/organizational-structure/organizational-structure-api.md` sections 8, 9, 10
- **Organizational Structure Next.js implementation profile:** `../modules/hr/features/organizational-structure/organizational-structure-web.md` sections 8, 10, 13
- **Organizational Structure Expo implementation profile:** `../modules/hr/features/organizational-structure/organizational-structure-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| organizational-structure-master | 4 | `834005c26053eb5eee6e85e186c98953501eda8584fb9e30055ec9bd16391cb8` |
| organizational-structure-master | 5 | `64373031171f20599d152686d589082cb88f6365efbd1a6f9badba308f4fe785` |
| organizational-structure-master | 6 | `a316d1bb04bf7dca2b1ec941cb7168ae1643a93d386676d4ce4677e08fb9875b` |
| organizational-structure-master | 7 | `0aec4883eaa2766ef0c3d4522286a307cff869fdad881fd36605e4bee72ee197` |
| organizational-structure-master | 9 | `7ceb12bb46037333513809999525207b50465f1d803c98dc76366d8248e070c6` |
| organizational-structure-api | 8 | `8427fbc60b6506434f168bbb92cebc0b07e6699dec5f0c7e336d6b0c7906c32a` |
| organizational-structure-api | 9 | `ca3344c325f6847d6ebb90bdf4dad7b53c7f21be08243f517703fa79044a6a5e` |
| organizational-structure-api | 10 | `46a8a38217724b9f5f77d9a0a1907516d853b42cdf62c072da7b1c29eac2f395` |
| organizational-structure-web | 8 | `81709390ab5691f03acc9dcd2b845f95f2a60c0ee2707ea8d96dcfc4efd4d812` |
| organizational-structure-web | 10 | `c25e75c25fae7744eb25e95dbc1644c94d4955fae4e6f87f95947b8decd7fb33` |
| organizational-structure-web | 13 | `f426db9a30f8de5984d35e6fcfbd4c2e466f6f573c87b20ee831432a35f69058` |
| organizational-structure-mobile | 2 | `6a6a29cf409d57eb361c3ff9dde4e2ced13fef399c23202326467a293cb0f5e4` |
| organizational-structure-mobile | 11 | `df3c9d0ed6eda9a04b4c65c683e7dd621a9e354ae7d8fdb31a5d79a9a4d0929d` |
| organizational-structure-mobile | 12 | `a8731c681436d699f98b56159978ab43b87dec90325e32bd0d384599339f2d4b` |
| organizational-structure-mobile | 15 | `85d324cd065dd2048f40a320715e506ab78f314b3db5d3481f67954747d86195` |
