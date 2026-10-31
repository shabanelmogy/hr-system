<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Angular Toolchain and Localization Runtime Phase 05 - Integration and Runtime

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

- **Angular Toolchain and Localization Runtime cross-platform master review:** `../modules/platform/features/angular-localization-foundation/angular-localization-foundation-review.md` sections 4, 5, 6, 7, 9
- **Angular Toolchain and Localization Runtime API implementation profile:** `../modules/platform/features/angular-localization-foundation/angular-localization-foundation-api.md` sections 8, 9, 10
- **Angular localization foundation Angular Web profile:** `../modules/platform/features/angular-localization-foundation/angular-localization-foundation-web.md` sections 8, 10, 13
- **Angular Toolchain and Localization Runtime Expo implementation profile:** `../modules/platform/features/angular-localization-foundation/angular-localization-foundation-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-localization-foundation-master | 4 | `2345e4c0df8f384bba2a2b07fe7e9f102ba3b93096314d620fa8be452461ed41` |
| angular-localization-foundation-master | 5 | `71dad2ca5b311ecc4d115bee358583247edb7e5498ec4f932e1dc5aa12bf55e9` |
| angular-localization-foundation-master | 6 | `7ef4ef81649a5cf87f78af83589a72bb1d3575294e98efe4da414ab698114f3e` |
| angular-localization-foundation-master | 7 | `c1f5c712a2d2529993fc7f4ac45fc8d015ad29fd934eadae86a2c98f7db5df49` |
| angular-localization-foundation-master | 9 | `46fb0447edae1fca09c9986213d9472d157e56cc4c960a40aced27e409d47265` |
| angular-localization-foundation-api | 8 | `ea76c301cccd425a113f3f51a0a51d3aef602e51c8b606d67dcad157be30c5cc` |
| angular-localization-foundation-api | 9 | `46fb0447edae1fca09c9986213d9472d157e56cc4c960a40aced27e409d47265` |
| angular-localization-foundation-api | 10 | `fe7928624f22f08764dcf7e54d5651be2cb0f41f1930ac527aaa94e00a35faf6` |
| angular-localization-foundation-web | 8 | `ea76c301cccd425a113f3f51a0a51d3aef602e51c8b606d67dcad157be30c5cc` |
| angular-localization-foundation-web | 10 | `fe7928624f22f08764dcf7e54d5651be2cb0f41f1930ac527aaa94e00a35faf6` |
| angular-localization-foundation-web | 13 | `a4f2b92cb7b0ddb46e4abfbc3ffd75253df09b1252afe8221c3bde9d44d2dd2e` |
| angular-localization-foundation-mobile | 2 | `dbb9c391093ad2e63ab72da54097310c2dfddd667487d0934e43c8bb5ca9c928` |
| angular-localization-foundation-mobile | 11 | `5dab27474a1b99ba062fd373bdbdb3dd3a8a6fe523b6dbf3da6991fc4335f10e` |
| angular-localization-foundation-mobile | 12 | `4df921c53578650ee76e8a453619da14a1a2cdaa1fad626c8f36e28cfb83d3b8` |
| angular-localization-foundation-mobile | 15 | `62ec30b9ccbca9d50a4cdc7e810991d098bf7138418711b4f7f9e1ef03d68a98` |
