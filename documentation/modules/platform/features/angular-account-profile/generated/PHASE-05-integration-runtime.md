<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Angular own account profile and password parity Phase 05 - Integration and Runtime

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

- **Angular own account profile and password parity cross-platform master review:** `../modules/platform/features/angular-account-profile/angular-account-profile-review.md` sections 4, 5, 6, 7, 9
- **Angular own account profile and password parity API implementation profile:** `../modules/platform/features/angular-account-profile/angular-account-profile-api.md` sections 8, 9, 10
- **Angular own account profile and password parity Next.js implementation profile:** `../modules/platform/features/angular-account-profile/angular-account-profile-web.md` sections 8, 10, 13
- **Angular own account profile and password parity Expo implementation profile:** `../modules/platform/features/angular-account-profile/angular-account-profile-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-account-profile-master | 4 | `56b31df492f4c4b102eeb2517deb5b9210e0630d9e03d8fa9c9562df7349a264` |
| angular-account-profile-master | 5 | `1205ea31f7ea3ffc38e298c7be619e6daeaa93b586ef5b14fac32712876ab545` |
| angular-account-profile-master | 6 | `a240983bf992c17a33cb7680bacfe0ef92dd3e2694296b1f3199cba091beca34` |
| angular-account-profile-master | 7 | `aa5ef891fd2f24c184c7aa7bf6720fd20da131dda59ae74add398dd07ea2b5bb` |
| angular-account-profile-master | 9 | `7da0be7c93de6bc7dc0ced4ee57e36358b8187f85dc0d1ec8983a7d092e0ecef` |
| angular-account-profile-api | 8 | `1e50eb56692bd565bb3353f0168de1eabbf9e0a92593a86357eb09f345ca62e0` |
| angular-account-profile-api | 9 | `ed13c68f331c3038939666427a9cc5068f8ad01b05b5678e7375e9c1b493cd36` |
| angular-account-profile-api | 10 | `39a850bc1222626cc35fa79f92f2e7bdf4fa4bdc9ee114f980916a360cd7c9c7` |
| angular-account-profile-web | 8 | `675ade0e2beebd6fb4de655089ba26147186e8f045b7db42901788f4934f3c36` |
| angular-account-profile-web | 10 | `438af24bd9f67431faa93f1e83fba4fcba3aa29879a2451b3369263fee350412` |
| angular-account-profile-web | 13 | `000e67480aa90c1fb7a36a8318e5f81cb7439ec0b10646d4c7c145c5584a2726` |
| angular-account-profile-mobile | 2 | `df70c382f865d5b353a86d16db73bed7d8a622e73b1e88274fa3433ff1c91a43` |
| angular-account-profile-mobile | 11 | `3a3987c56d55e9a5e1281f0241ff2eaad283e4692d917fe71dc5cc8b471231d0` |
| angular-account-profile-mobile | 12 | `e9580d57ea69639ea644cb36be792c4cc0a8bc3dc642e2c3c620453f6326728f` |
| angular-account-profile-mobile | 15 | `03132b882cadf2168d6fc45cb37f61c9c53c20f540719ce66683b9ccf1e3758b` |
