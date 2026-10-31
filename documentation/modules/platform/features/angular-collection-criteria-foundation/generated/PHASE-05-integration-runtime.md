<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Shared collection criteria URL preparation Phase 05 - Integration and Runtime

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

- **Shared collection criteria URL preparation cross-platform master review:** `../modules/platform/features/angular-collection-criteria-foundation/angular-collection-criteria-foundation-review.md` sections 4, 5, 6, 7, 9
- **Shared collection criteria URL preparation API implementation profile:** `../modules/platform/features/angular-collection-criteria-foundation/angular-collection-criteria-foundation-api.md` sections 8, 9, 10
- **Shared collection criteria URL preparation Next.js implementation profile:** `../modules/platform/features/angular-collection-criteria-foundation/angular-collection-criteria-foundation-web.md` sections 8, 10, 13
- **Shared collection criteria URL preparation Expo implementation profile:** `../modules/platform/features/angular-collection-criteria-foundation/angular-collection-criteria-foundation-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-collection-criteria-foundation-master | 4 | `bcf2c705898c5e13f7a4b5bc6b350f2ee08fff544ba58a8525ccec6b36720864` |
| angular-collection-criteria-foundation-master | 5 | `b26b87322048e11590e55342af5142b1a15eb66624a7a0565a0e13c1d67303bc` |
| angular-collection-criteria-foundation-master | 6 | `0b2ae962f994a597a781fc41c0f929c39c5fde0d2719e1e7a5044162464bd027` |
| angular-collection-criteria-foundation-master | 7 | `1d85249d77efc9832fc5f094b4a3dd8b26add9e8fb63d4f71adb9f121d9cb791` |
| angular-collection-criteria-foundation-master | 9 | `f5dee5a7372a530fad3f09162a7ff49f3dce3d00ab98770778cd64a826e95939` |
| angular-collection-criteria-foundation-api | 8 | `edb03e0306a5c1288467e8473feb2d2ac2a124ea340b41fd06c98df22d02bd9c` |
| angular-collection-criteria-foundation-api | 9 | `f5dee5a7372a530fad3f09162a7ff49f3dce3d00ab98770778cd64a826e95939` |
| angular-collection-criteria-foundation-api | 10 | `02ba8586978267daf88bbdae9c6f80c10475256d6e6d22678381eb3524460df7` |
| angular-collection-criteria-foundation-web | 8 | `edb03e0306a5c1288467e8473feb2d2ac2a124ea340b41fd06c98df22d02bd9c` |
| angular-collection-criteria-foundation-web | 10 | `02ba8586978267daf88bbdae9c6f80c10475256d6e6d22678381eb3524460df7` |
| angular-collection-criteria-foundation-web | 13 | `f1529e78e2a45214b981027e6a6a8fdea12baff581eccb382d8c3271aeb232bb` |
| angular-collection-criteria-foundation-mobile | 2 | `fde38cd94f53af728f6c35253ef0a93a7b82029b204a20b593656b5d297a083c` |
| angular-collection-criteria-foundation-mobile | 11 | `502b954c32abefbd0082fee8267e052b96b704dbfcaae228c6df849fae440112` |
| angular-collection-criteria-foundation-mobile | 12 | `91845ae82173d358932b92bf87a56347c6e13d44c7555b63beca22641118b9e3` |
| angular-collection-criteria-foundation-mobile | 15 | `2037541feac6c347eb95739d4155a9ac1b00451f8d51a2659dfef1abed0c63d5` |
