<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Shared all-filtered Excel and CSV export Phase 05 - Integration and Runtime

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

- **Shared all-filtered Excel and CSV export cross-platform master review:** `../modules/platform/features/angular-collection-export/angular-collection-export-review.md` sections 4, 5, 6, 7, 9
- **Shared all-filtered Excel and CSV export API implementation profile:** `../modules/platform/features/angular-collection-export/angular-collection-export-api.md` sections 8, 9, 10
- **Shared all-filtered Excel and CSV export Next.js implementation profile:** `../modules/platform/features/angular-collection-export/angular-collection-export-web.md` sections 8, 10, 13
- **Shared all-filtered Excel and CSV export Expo implementation profile:** `../modules/platform/features/angular-collection-export/angular-collection-export-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-collection-export-master | 4 | `11ab4fd40aa5c27d030d22f24d84c6ba4aa8773f59f94187bbfe01cad619991c` |
| angular-collection-export-master | 5 | `2848d51a90cc824caaf3a08b86ab5b84e0fcb9f3ff0e57d8c8564e57c052fcb7` |
| angular-collection-export-master | 6 | `a261439a7e54afa223514c4b4c8a291ad970e428010bdf50cccb9644f45a9743` |
| angular-collection-export-master | 7 | `22a4d8edb5b7c12c4ef24386083a68460c545b2812f26a0b4b84929c92765310` |
| angular-collection-export-master | 9 | `0314d42449a9d815704ec1cae9e1b9a83cdc2fd19c9822997852028d23c15113` |
| angular-collection-export-api | 8 | `2bd7cae6c908f53e4d96af362446cc66c27886f0a5c931fff2193898b3c39b30` |
| angular-collection-export-api | 9 | `0314d42449a9d815704ec1cae9e1b9a83cdc2fd19c9822997852028d23c15113` |
| angular-collection-export-api | 10 | `d1edf745c381758e648f1843d464426c2fdbb943b90ae1d70f8e0c2e7583ac2d` |
| angular-collection-export-web | 8 | `2bd7cae6c908f53e4d96af362446cc66c27886f0a5c931fff2193898b3c39b30` |
| angular-collection-export-web | 10 | `d1edf745c381758e648f1843d464426c2fdbb943b90ae1d70f8e0c2e7583ac2d` |
| angular-collection-export-web | 13 | `55b050a45687faf98ffdae6c1e861adedf4af7806a6984385063f1574191dd04` |
| angular-collection-export-mobile | 2 | `3d4d1cccf9731878c83a180ea9cf3da19bc60b22638d9ca80429936b688d972c` |
| angular-collection-export-mobile | 11 | `be1f78514e46607c9b87c07d2f3512c055e814008c906d57690f5c96bbc11a4a` |
| angular-collection-export-mobile | 12 | `ba0b2122f3a968f88a94c47f3a7c139acec2450c3fff68b282c846bf5e4e9201` |
| angular-collection-export-mobile | 15 | `83d879e9ab7872435646db453eac0de0f0d0e57c04107249e9e8ebd6145164ce` |
