<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Countries XLSX import Phase 05 - Integration and Runtime

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

- **Countries XLSX import cross-platform master review:** `../modules/platform/features/angular-countries-import-view/angular-countries-import-view-review.md` sections 4, 5, 6, 7, 9
- **Countries XLSX import API implementation profile:** `../modules/platform/features/angular-countries-import-view/angular-countries-import-view-api.md` sections 8, 9, 10
- **Countries XLSX import Angular implementation profile:** `../modules/platform/features/angular-countries-import-view/angular-countries-import-view-web.md` sections 8, 10, 13
- **Countries XLSX import Expo implementation profile:** `../modules/platform/features/angular-countries-import-view/angular-countries-import-view-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-import-view-master | 4 | `53e60870bac7336b7b85981032dd3b9944a2a288a91459982cb0a8c20142c42c` |
| angular-countries-import-view-master | 5 | `3673a2c7c459efed4be5b56d814d01b31e1291b7cc3c645b9106386457f5d443` |
| angular-countries-import-view-master | 6 | `3cb1ce59d5da20c1c670d16496538c270effb436933ee0e13048f912397e6a61` |
| angular-countries-import-view-master | 7 | `19d1a25a2d02717bc26c96f2207373eee86a5a2dc4cc5440e012ce32bcac8c81` |
| angular-countries-import-view-master | 9 | `bbba187c534e0637214cb864a3f268ffdf3dca121eaad7f9d413334fe10dea0d` |
| angular-countries-import-view-api | 8 | `b3c4409235a89b89abcc628d2a834a38b5c30d5793e24bfb207a2c9bcd6f1677` |
| angular-countries-import-view-api | 9 | `bbba187c534e0637214cb864a3f268ffdf3dca121eaad7f9d413334fe10dea0d` |
| angular-countries-import-view-api | 10 | `47e64969da4971e661128ac73ad0f901ccfd17949c2856ffdd37c0c37bda76c3` |
| angular-countries-import-view-web | 8 | `b3c4409235a89b89abcc628d2a834a38b5c30d5793e24bfb207a2c9bcd6f1677` |
| angular-countries-import-view-web | 10 | `47e64969da4971e661128ac73ad0f901ccfd17949c2856ffdd37c0c37bda76c3` |
| angular-countries-import-view-web | 13 | `4d7bd414678262665b7f89f01a552b43bf3120d65e993916c20f11e45fdc0743` |
| angular-countries-import-view-mobile | 2 | `c96148e173107ae3b96ee6247440e6b3d9d69cb7fbba1304df5e66e4328111e2` |
| angular-countries-import-view-mobile | 11 | `6cb7786af1c177babf51eb605ea16c9cb5f85484c6a2a6d6ea138e39cbf67aa0` |
| angular-countries-import-view-mobile | 12 | `ec1a71bb79a1df59c7669872683dbb8180c0c987562423a18eb8b0e64c12b4be` |
| angular-countries-import-view-mobile | 15 | `2f531c9e1a7906ca3b77d3d7d45409b64b8d6e107eae70cfc1b6a511ac1c9e8e` |
