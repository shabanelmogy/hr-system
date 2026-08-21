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
| master | 4 | `d37a682ba9744f70bdcbcc638c1e4478487a97d079da7960b292ae7746c784bd` |
| master | 5 | `4b5e21317ec85f4069a90ae400241c3669950251d859d6d30258815b66f476d9` |
| master | 6 | `e671cfed0bfb63b0063c4f83c86be605190925f9dc7e6b1ef6e335c26fb89c54` |
| master | 7 | `a569747a5ae09a0eb3f1619080e56572e4f79a0c722408583485e404f2654f8a` |
| master | 9 | `abba6bf0a3940b1b8b716d85be4964c054059387ffe9897256bd60f0093d141d` |
| api | 8 | `19ba24881ed075978da2d89d9f5d6ac913ca8289d14d251464edfd93ab1e8c12` |
| api | 9 | `d573f11dbd27c997e0f25cadcdbfb27a171809b7cd3ac088a355154f6c9c0105` |
| api | 10 | `6267cad08ac31db9d3fefbf5abda40d64d5be3e91d08b0eb42495ebd14b40aba` |
| web | 8 | `43a7e4cb95554e828d56afdc3c933a1b1f224531dc5829a1c6d0b31e25f632fe` |
| web | 10 | `682e46462332424893cbefabc1d0e831e4e8b1786aac15db8618f98a53acf608` |
| web | 13 | `10a6cf1f7b73698bd57e74ccbcbe1b5a50fa96af854189b82ba63e75543e6f88` |
| mobile | 2 | `21269af699d3bfad64b852c262d640017d620ac4165fa112561ef66626153552` |
| mobile | 11 | `c40a360cd02c08732fae89e680c641e2a251a818b9e84456a47e618f84c7b8e5` |
| mobile | 12 | `0f0448cb6bfbd6c14def633a07bb9148564323efd7e372d4f678a2a9f8d41153` |
| mobile | 15 | `1f4ec4134d0b95a3e858a7ad3c3c2457d03d0db1b92f97e8f885b56021174164` |
