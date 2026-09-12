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

- **Countries cross-platform master review:** `../project/COUNTRIES_FEATURE_FULL_REVIEW.md` sections 4, 5, 6, 7, 9
- **Countries API implementation profile:** `../api/Countries_API_Implementation_Profile.md` sections 8, 9, 10
- **Countries Next.js implementation profile:** `../web-next/features/countries-frontend-reference.md` sections 8, 10, 13
- **Countries Expo implementation profile:** `../mobile-react/countries-mobile-reference.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| master | 4 | `640408799d07c9939468c39e65e9d2601daa6e89d7896f24b13a924f4ecbb04d` |
| master | 5 | `468fe7a38b8c78400af07b8fdb39e4d5cae4a8187e629e948f02e405e497f1d1` |
| master | 6 | `b7fb453c6be690cf10f98e85664f30fb55fb590e628b0f8a0435f54cf67058ac` |
| master | 7 | `8c0ba157ab3e6ca7bfa97bd23bdd022523f69dc7ac4386e25462b7ad667ba74b` |
| master | 9 | `ed59b360ae53fc2f41202cdcd6a29204f1c4d31e6b95a83b08dbf773d0f21b7f` |
| api | 8 | `6ba0561bbba0e93a7ce34482ec27b468c6d56b5255c755acb11d8b29f74bb994` |
| api | 9 | `c1c6f745e49d895fa7a91d52fd3616c3c0010c46c00cd5c472f2c7e65f1791d3` |
| api | 10 | `09f8411b30c1b462ae52bbe73f77f5f6af82d57d7d681ed2a0c3b6335617e520` |
| web | 8 | `43a7e4cb95554e828d56afdc3c933a1b1f224531dc5829a1c6d0b31e25f632fe` |
| web | 10 | `dfca66fe993ca501dfd506da6673879ea9c49d5f9fa8fcd1050486f4346ffaeb` |
| web | 13 | `1c90d3dd20930778b30dc420364d74418afc2a33d49768e5462c7470d1cd31f7` |
| mobile | 2 | `21269af699d3bfad64b852c262d640017d620ac4165fa112561ef66626153552` |
| mobile | 11 | `e2b2b0b111d9af12d78f480ab879e0a867528d6cdbdb1bed313ec87c78978ba4` |
| mobile | 12 | `0f0448cb6bfbd6c14def633a07bb9148564323efd7e372d4f678a2a9f8d41153` |
| mobile | 15 | `7fd51151939907e42eeda66b24dcbcefc87b13a2563a2e8ee45715b98f02b0fb` |
