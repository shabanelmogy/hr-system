<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Platform Settings Phase 05 - Integration and Runtime

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

- **Platform Settings cross-platform master review:** `../modules/platform/features/platform-settings/platform-settings-review.md` sections 4, 5, 6, 7, 9
- **Platform Settings API implementation profile:** `../modules/platform/features/platform-settings/platform-settings-api.md` sections 8, 9, 10
- **Platform Settings Next.js implementation profile:** `../modules/platform/features/platform-settings/platform-settings-web.md` sections 8, 10, 13
- **Platform Settings Expo implementation profile:** `../modules/platform/features/platform-settings/platform-settings-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| platform-settings-master | 4 | `1e6e30d327293c1ef34116ee5580e98d7b008fe943f3ebb221db1c5c4df40ea0` |
| platform-settings-master | 5 | `08772127320e7828195f1e636236d2314b72787ec5aaf1c20160b18d42d4ebd5` |
| platform-settings-master | 6 | `561a04d004f55425502034332d421de9b0ac65843d053222311168511572cd1f` |
| platform-settings-master | 7 | `ba48ae018c9641925daf2835ba4e18577f257124b3312244495b5ed7da6b1fad` |
| platform-settings-master | 9 | `80b504af5387ba895ab9d9516770efe5f4fd3f590a8fe0b8fe05ae9495c205c3` |
| platform-settings-api | 8 | `b4b85b84dd4a6eb867090d3024f1aeac578479a819de55d47917502a6f02034e` |
| platform-settings-api | 9 | `705267b53d0736f6c557f2b10985d7ad6dabcfe01cba7ec61074506ced42856f` |
| platform-settings-api | 10 | `b8d7735a0908620b69365d6a702eb28f9dfc25f1784676ef7668c14b98eb47aa` |
| platform-settings-web | 8 | `5b736cbade699cee98766cd89ff87ca5c6501f02d231619a70d433e4e032b3f1` |
| platform-settings-web | 10 | `634867856ac3d3ab52d08e62ff4514ce0e0ca5383d7cd73274dcf59fab24a21c` |
| platform-settings-web | 13 | `b38008cd6444388773fd216d85e9ad3ccd41eba03d5566b5d47e0ad4bcb51e87` |
| platform-settings-mobile | 2 | `bb945b74ccca2581a9d6a3dbafa3fde16c98fab95d2c83d555ab0f27d16d7b8f` |
| platform-settings-mobile | 11 | `cd598a2c052fe27d3a4df855a05d01e7c846987f9f5a091d2350f1c2cab1623b` |
| platform-settings-mobile | 12 | `e5cacf6ed728d7e0e7fa4b04eed4e34c551ccec6bce0753b1ec4c39ee01eae2b` |
| platform-settings-mobile | 15 | `b64bc8a323caaa8c4135b08246c9cd791f1dbc8f4d2429624db41fccb99cd8ef` |
