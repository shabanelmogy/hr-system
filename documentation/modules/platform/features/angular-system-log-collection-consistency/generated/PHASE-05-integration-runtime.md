<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# System log collection consistency Phase 05 - Integration and Runtime

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

- **System log collection consistency cross-platform master review:** `../modules/platform/features/angular-system-log-collection-consistency/angular-system-log-collection-consistency-review.md` sections 4, 5, 6, 7, 9
- **System log collection consistency API implementation profile:** `../modules/platform/features/angular-system-log-collection-consistency/angular-system-log-collection-consistency-api.md` sections 8, 9, 10
- **System log collection consistency Next.js implementation profile:** `../modules/platform/features/angular-system-log-collection-consistency/angular-system-log-collection-consistency-web.md` sections 8, 10, 13
- **System log collection consistency Expo implementation profile:** `../modules/platform/features/angular-system-log-collection-consistency/angular-system-log-collection-consistency-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-log-collection-consistency-master | 4 | `48c9478184f5033a48097e62acc5a2b2bd1e174bb765f79f6cc76529c724ed2f` |
| angular-system-log-collection-consistency-master | 5 | `6023544e13d3ee21aab652cc92b31a9a24e6cba2d3c63b2d19d8ec031acc0dfc` |
| angular-system-log-collection-consistency-master | 6 | `191b49556278f89e498ed723a4a08d42cc1013ffb4e628050059a6700b74d79d` |
| angular-system-log-collection-consistency-master | 7 | `260ff8388a7a43e7e9e6e645ce76762eadc8407569b146300d93b6bd9ed6ec89` |
| angular-system-log-collection-consistency-master | 9 | `8211a083005f754d21dfa0bd936831bb555e61db53028af36cbc795838d56f79` |
| angular-system-log-collection-consistency-api | 8 | `93e012929f86efae1c41d1bb5229dc18332bb0ba8c1edd71eacd06812fbb5a5d` |
| angular-system-log-collection-consistency-api | 9 | `8211a083005f754d21dfa0bd936831bb555e61db53028af36cbc795838d56f79` |
| angular-system-log-collection-consistency-api | 10 | `f58efe9c771befa7aaf5130a56df6fce26a6cea8aa27f40edb6c4155c0b63b54` |
| angular-system-log-collection-consistency-web | 8 | `93e012929f86efae1c41d1bb5229dc18332bb0ba8c1edd71eacd06812fbb5a5d` |
| angular-system-log-collection-consistency-web | 10 | `f58efe9c771befa7aaf5130a56df6fce26a6cea8aa27f40edb6c4155c0b63b54` |
| angular-system-log-collection-consistency-web | 13 | `42d3611e86b09eb7fc0975ef038314c3fdf6be16d5e850c28f690cd2f05f4565` |
| angular-system-log-collection-consistency-mobile | 2 | `f0823b6af2c0f834ce156a0bee907ae7335e7b4ef055c845b067ac0c327cabc5` |
| angular-system-log-collection-consistency-mobile | 11 | `613af3d9d0b6f6423157ad14b5562c697d985c7fbbd14178956312e386c51898` |
| angular-system-log-collection-consistency-mobile | 12 | `a86a597260fd56170b6a943f63b37be006e5ad02fa532382cbda79c78e599ec2` |
| angular-system-log-collection-consistency-mobile | 15 | `1b14b0c6c92d9297d61c502029d5716d707e7cf8f4c0e4125190ba178da45518` |
