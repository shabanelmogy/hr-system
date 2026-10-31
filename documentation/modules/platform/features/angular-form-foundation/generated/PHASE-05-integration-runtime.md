<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Angular Shared Text Fields and Form Submission Phase 05 - Integration and Runtime

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

- **Angular Shared Text Fields and Form Submission cross-platform master review:** `../modules/platform/features/angular-form-foundation/angular-form-foundation-review.md` sections 4, 5, 6, 7, 9
- **Angular Shared Text Fields and Form Submission API implementation profile:** `../modules/platform/features/angular-form-foundation/angular-form-foundation-api.md` sections 8, 9, 10
- **Angular Shared Text Fields and Form Submission Next.js implementation profile:** `../modules/platform/features/angular-form-foundation/angular-form-foundation-web.md` sections 8, 10, 13
- **Angular Shared Text Fields and Form Submission Expo implementation profile:** `../modules/platform/features/angular-form-foundation/angular-form-foundation-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-form-foundation-master | 4 | `1b47dfc85b7c0c905a5cfc0e75f64cdc37b04cf1e47a64acd27ba7fb18fe99c9` |
| angular-form-foundation-master | 5 | `c6d1c95cb6dfb29c3a4eb08fcf1592391d0d06246967c3fab9725067f8bc2687` |
| angular-form-foundation-master | 6 | `4c846e1af1e4f8be32a79a58ff2f272759a316890b776c9960c0096a4661669a` |
| angular-form-foundation-master | 7 | `e46cfce5be74e89543f3d8ad5ef40f3640578392f7f72abee376d81c0041bcf8` |
| angular-form-foundation-master | 9 | `9e69e079b4dcc5b2ca68cde1376645625bb85e1030a5da4e8083eb9453d322ee` |
| angular-form-foundation-api | 8 | `8e9a6c65ec70640c0b36054bd0f77faedfee71f12d1eb28d45398ddfb7365b67` |
| angular-form-foundation-api | 9 | `9e69e079b4dcc5b2ca68cde1376645625bb85e1030a5da4e8083eb9453d322ee` |
| angular-form-foundation-api | 10 | `7cef5c81383b73aa3f407c82f8fbd0dd848ef5b67a6e2f0eb8adfb995ec8d14c` |
| angular-form-foundation-web | 8 | `8e9a6c65ec70640c0b36054bd0f77faedfee71f12d1eb28d45398ddfb7365b67` |
| angular-form-foundation-web | 10 | `7cef5c81383b73aa3f407c82f8fbd0dd848ef5b67a6e2f0eb8adfb995ec8d14c` |
| angular-form-foundation-web | 13 | `d369cbf630d95eb29023602fbe352a2095526c95a1d43009ad38382a265e53c6` |
| angular-form-foundation-mobile | 2 | `f2251a944a00c8155b578e2ac7e59625798f5ab536762ef52fd00529ba0982d6` |
| angular-form-foundation-mobile | 11 | `391d65f6b02080f8b4bacf2293b5a07a1aa69f834d784a1d94b4bb86400ee81c` |
| angular-form-foundation-mobile | 12 | `70f10c72924980a36133310b0a7b4dc18511cb110b18323a79dd960adcbc8be3` |
| angular-form-foundation-mobile | 15 | `54f8cda59095ce454f27c117ced12176d1875b32cd22697e8b4351e002588c77` |
