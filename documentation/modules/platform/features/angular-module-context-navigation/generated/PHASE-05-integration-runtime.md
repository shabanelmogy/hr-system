<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Angular application context navigation Phase 05 - Integration and Runtime

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

- **Angular application context navigation cross-platform master review:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-review.md` sections 4, 5, 6, 7, 9
- **Angular application context navigation API implementation profile:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-api.md` sections 8, 9, 10
- **Angular application context navigation Next.js implementation profile:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-web.md` sections 8, 10, 13
- **Angular application context navigation Expo implementation profile:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-module-context-navigation-master | 4 | `c1324c1cfb273d7ea9912b07e2c2e2eb5826afac16b1e3439e4c10d30ed5a0a0` |
| angular-module-context-navigation-master | 5 | `ad37f9208578207bb142bb810412eea23caf874669fcc873c8cfd31d088c353d` |
| angular-module-context-navigation-master | 6 | `8ec030f4e1c72aa5c699512260c1c57d68ebd7688d2b02e3013500dd8f961336` |
| angular-module-context-navigation-master | 7 | `121cd35d3780b240c74f440e3f368fc2c3e388ea0b602cfe9595e04f66aa23ea` |
| angular-module-context-navigation-master | 9 | `5c8b535c12fcf226da0d043061e2fe30da081036abe32c27e1862428f2f872a9` |
| angular-module-context-navigation-api | 8 | `8fe455f912589c8225049720348791a1b3f36a0bbb64fd18640fe27e425f1726` |
| angular-module-context-navigation-api | 9 | `5c8b535c12fcf226da0d043061e2fe30da081036abe32c27e1862428f2f872a9` |
| angular-module-context-navigation-api | 10 | `dddfcf4db65993beab3a319f9abebb699878f3620d64ea3cab5d74456652b3e5` |
| angular-module-context-navigation-web | 8 | `8fe455f912589c8225049720348791a1b3f36a0bbb64fd18640fe27e425f1726` |
| angular-module-context-navigation-web | 10 | `dddfcf4db65993beab3a319f9abebb699878f3620d64ea3cab5d74456652b3e5` |
| angular-module-context-navigation-web | 13 | `056ee58455fb971a375392b39fb541869ce38b807f5b937eb3c8353ed316a30b` |
| angular-module-context-navigation-mobile | 2 | `cd0441cf47d901383bbcd3f66cd55e25b22eca84f14b433a4c4e5a4136a775b5` |
| angular-module-context-navigation-mobile | 11 | `1fbb9765392d357a650913625dc67d4591b4d163b68b5ee40e753d1d5e1b6168` |
| angular-module-context-navigation-mobile | 12 | `4b8a857346e8e30ca6d40ceb3ec49deba68787019ea091c95ba451bc002452fe` |
| angular-module-context-navigation-mobile | 15 | `323b611e52e573c8ef93e22bf36d9791e49bb95dcc9470fc3678b072b0d8b13e` |
