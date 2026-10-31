<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Shared form close and discard protection preparation Phase 05 - Integration and Runtime

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

- **Shared form close and discard protection preparation cross-platform master review:** `../modules/platform/features/angular-form-close-foundation/angular-form-close-foundation-review.md` sections 4, 5, 6, 7, 9
- **Shared form close and discard protection preparation API implementation profile:** `../modules/platform/features/angular-form-close-foundation/angular-form-close-foundation-api.md` sections 8, 9, 10
- **Shared form close and discard protection preparation Next.js implementation profile:** `../modules/platform/features/angular-form-close-foundation/angular-form-close-foundation-web.md` sections 8, 10, 13
- **Shared form close and discard protection preparation Expo implementation profile:** `../modules/platform/features/angular-form-close-foundation/angular-form-close-foundation-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-form-close-foundation-master | 4 | `5fc7d645c55b8674538b2405cbf039335f1c80730857fca4ea52a186dacb84c0` |
| angular-form-close-foundation-master | 5 | `9ff921df4fc4987bf8c7a0eeb12c2ad7d91105c91a00c35f6240c4efe1ebfdcc` |
| angular-form-close-foundation-master | 6 | `d5fb222d29ead96431323a1755b2c748ea1335302de11d1ad14575291103f605` |
| angular-form-close-foundation-master | 7 | `0c884f06aa2e75bd9f136e9365f91561c4ef13e1f3e17a2c77e28a2700dd773f` |
| angular-form-close-foundation-master | 9 | `002c5fe15f5407d5954a85ce70ef6911009c88295b1c3e9a446352e1ab1b54b3` |
| angular-form-close-foundation-api | 8 | `af092a52399af807c36db18e03a6c61f0200e7224c489154f642658fba937053` |
| angular-form-close-foundation-api | 9 | `002c5fe15f5407d5954a85ce70ef6911009c88295b1c3e9a446352e1ab1b54b3` |
| angular-form-close-foundation-api | 10 | `64ded57526a8d16ecde8062de57ffe03d672821496b2b90463c0ad414b8c6d58` |
| angular-form-close-foundation-web | 8 | `af092a52399af807c36db18e03a6c61f0200e7224c489154f642658fba937053` |
| angular-form-close-foundation-web | 10 | `64ded57526a8d16ecde8062de57ffe03d672821496b2b90463c0ad414b8c6d58` |
| angular-form-close-foundation-web | 13 | `e50853d075d6599db13a62e17466aceb8a03922b0075831025dc7600a97ab461` |
| angular-form-close-foundation-mobile | 2 | `4ab0b42bd0b34312c2e638a081f2d521b5b832d980c26ca738ff6c3c0421da13` |
| angular-form-close-foundation-mobile | 11 | `010af5b5f1816905cc3eab29abd889a2eace387f4e457e73a24eae4fd88f464d` |
| angular-form-close-foundation-mobile | 12 | `3fc2e5d7e403b7d8d34c7e223add6ab92e092acbcd49957be85122e47b9c57e5` |
| angular-form-close-foundation-mobile | 15 | `a0a6f1ba19e837a1de59300f14235daf86d940a40c79ac144f52cf4cd5f1e4c4` |
