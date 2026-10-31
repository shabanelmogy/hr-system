<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Shared scoped read lifecycle preparation Phase 05 - Integration and Runtime

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

- **Shared scoped read lifecycle preparation cross-platform master review:** `../modules/platform/features/angular-scoped-read-lifetime-foundation/angular-scoped-read-lifetime-foundation-review.md` sections 4, 5, 6, 7, 9
- **Shared scoped read lifecycle preparation API implementation profile:** `../modules/platform/features/angular-scoped-read-lifetime-foundation/angular-scoped-read-lifetime-foundation-api.md` sections 8, 9, 10
- **Shared scoped read lifecycle preparation Next.js implementation profile:** `../modules/platform/features/angular-scoped-read-lifetime-foundation/angular-scoped-read-lifetime-foundation-web.md` sections 8, 10, 13
- **Shared scoped read lifecycle preparation Expo implementation profile:** `../modules/platform/features/angular-scoped-read-lifetime-foundation/angular-scoped-read-lifetime-foundation-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-scoped-read-lifetime-foundation-master | 4 | `fe22ce8087188029336855eb16ec1e82797e034f78d0a17de9ebcfe967f56835` |
| angular-scoped-read-lifetime-foundation-master | 5 | `7032fb41fa7fb04596774df8bf48965cb55dcd7da1690659abf5038c3dddee05` |
| angular-scoped-read-lifetime-foundation-master | 6 | `b1ed3701da1066a418fd9708b7074be2ee8ec02e1aec3eae95b3a5fd7932e45f` |
| angular-scoped-read-lifetime-foundation-master | 7 | `0e2559819911bcd2239cd56e19d5829f4de4f8bc29794dc7b1a0745ebd677f26` |
| angular-scoped-read-lifetime-foundation-master | 9 | `40c959e2c189d36d2616af34473c0acaf8e389ee88a9844d27c10ac7767682ef` |
| angular-scoped-read-lifetime-foundation-api | 8 | `1f828870c40492b5373285085bdbdd3baed7160e0ab16279f29f7886293254c9` |
| angular-scoped-read-lifetime-foundation-api | 9 | `40c959e2c189d36d2616af34473c0acaf8e389ee88a9844d27c10ac7767682ef` |
| angular-scoped-read-lifetime-foundation-api | 10 | `0375ed805314d411457a3111f0e06abbc07908f2541f02c9588a834a24f36b52` |
| angular-scoped-read-lifetime-foundation-web | 8 | `1f828870c40492b5373285085bdbdd3baed7160e0ab16279f29f7886293254c9` |
| angular-scoped-read-lifetime-foundation-web | 10 | `0375ed805314d411457a3111f0e06abbc07908f2541f02c9588a834a24f36b52` |
| angular-scoped-read-lifetime-foundation-web | 13 | `9dbd734d9f7fa9887a086f61f728bdf098c0879e84f30ff462ca2c2fde9fdaa0` |
| angular-scoped-read-lifetime-foundation-mobile | 2 | `1bb9daf1545478de79c557020442733fa754af50a233daa5573cfde1c1724bcd` |
| angular-scoped-read-lifetime-foundation-mobile | 11 | `e26d99a0a657ccafbb59bd2de87c3d7f447cf25a3239c9ea26f0a39b952de8fc` |
| angular-scoped-read-lifetime-foundation-mobile | 12 | `83c84ad268b229bca4c4b1e1917ab3585f88c1f024376d0c01c100ab72a9dab3` |
| angular-scoped-read-lifetime-foundation-mobile | 15 | `4ec4717c052e3bd05ffd044457f074133397f2a7ddec46eab6a6dc83cd9a3d87` |
