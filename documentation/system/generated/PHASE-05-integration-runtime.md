<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Phase 05 - Integration and Runtime

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
- [ ] A successful mutation refreshes all open clients through their normal cache/realtime path.
- [ ] Notification action URLs land on authorized routes in both clients.
- [ ] Unauthorized, read-only, validation, not-found, conflict, and network failures render safely.
- [ ] Production build configuration does not rely on local-only URLs or secrets.
- [ ] Localization and RTL are tested in actual runtime layouts.

## Approved references

- **Countries cross-platform master review:** `../project/COUNTRIES_FEATURE_FULL_REVIEW.md` sections 4, 5, 6, 7, 9
- **Countries API implementation profile:** `../api/Countries_API_Implementation_Profile.md` sections 8, 9, 10
- **Countries Next.js implementation profile:** `../web-next/features/countries-frontend-reference.md` sections 8, 10, 13
- **Countries Expo implementation profile:** `../mobile-react/countries-mobile-reference.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| master | 4 | `b23b2333eb1c612669ddd269677711f77cebee002628a2903f3e10262a5184f3` |
| master | 5 | `2cdbe8144a3a162b37b15d5ab908390ccf64c964ac18cc1808813d84d45fc994` |
| master | 6 | `e671cfed0bfb63b0063c4f83c86be605190925f9dc7e6b1ef6e335c26fb89c54` |
| master | 7 | `8c0ba157ab3e6ca7bfa97bd23bdd022523f69dc7ac4386e25462b7ad667ba74b` |
| master | 9 | `abba6bf0a3940b1b8b716d85be4964c054059387ffe9897256bd60f0093d141d` |
| api | 8 | `19ba24881ed075978da2d89d9f5d6ac913ca8289d14d251464edfd93ab1e8c12` |
| api | 9 | `d573f11dbd27c997e0f25cadcdbfb27a171809b7cd3ac088a355154f6c9c0105` |
| api | 10 | `227e13a27928f6d22c69cfa2b190b987539127edff9229588fc481c425639ef3` |
| web | 8 | `43a7e4cb95554e828d56afdc3c933a1b1f224531dc5829a1c6d0b31e25f632fe` |
| web | 10 | `dfca66fe993ca501dfd506da6673879ea9c49d5f9fa8fcd1050486f4346ffaeb` |
| web | 13 | `3d4ffdea15ae5bd3fde84ac212722f02339bd44568b04ac1b5f2041e24b61700` |
| mobile | 2 | `21269af699d3bfad64b852c262d640017d620ac4165fa112561ef66626153552` |
| mobile | 11 | `6713a595a06dae100c2d8f6e08528cf24699bc5a12d243524b2c02d8a5d837e3` |
| mobile | 12 | `0f0448cb6bfbd6c14def633a07bb9148564323efd7e372d4f678a2a9f8d41153` |
| mobile | 15 | `ce8ca1b504d5ecd725af6094f99b0eb4d45aac0bb272157ad9698c3fc3c6d549` |
