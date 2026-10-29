<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Angular Password Sign-in and Session Entry Phase 05 - Integration and Runtime

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

- **Angular Password Sign-in and Session Entry cross-platform master review:** `../modules/platform/features/angular-password-sign-in/angular-password-sign-in-review.md` sections 4, 5, 6, 7, 9
- **Angular Password Sign-in and Session Entry API implementation profile:** `../modules/platform/features/angular-password-sign-in/angular-password-sign-in-api.md` sections 8, 9, 10
- **Angular Password Sign-in and Session Entry Next.js implementation profile:** `../modules/platform/features/angular-password-sign-in/angular-password-sign-in-web.md` sections 8, 10, 13
- **Angular Password Sign-in and Session Entry Expo implementation profile:** `../modules/platform/features/angular-password-sign-in/angular-password-sign-in-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-password-sign-in-master | 4 | `d06b04062d6c005d2e30e19b963b1a4ce012c21c495812ea6ecba8ce076468e7` |
| angular-password-sign-in-master | 5 | `16451bc961f142c6a8c1c431ff6c340da11492ea5f23843de448ef5b3d3dafcb` |
| angular-password-sign-in-master | 6 | `0e3a09ab847df948a96ac927449465c464811f6340cf891e2ae5a8ff7a770f89` |
| angular-password-sign-in-master | 7 | `e4f6797163f888606842779e37f5fd483d649ff93504447be1234913e9563c6d` |
| angular-password-sign-in-master | 9 | `1c4d78b720a7cdf945b7660d390d8dc8231cdb31b67d5839949dd89d27c6741e` |
| angular-password-sign-in-api | 8 | `20bb0006bf41335f8388d59ee615c62130b86c47d6054816da5b6ffffcd1ef4f` |
| angular-password-sign-in-api | 9 | `1c4d78b720a7cdf945b7660d390d8dc8231cdb31b67d5839949dd89d27c6741e` |
| angular-password-sign-in-api | 10 | `ca3239d03a84ac7440b0a9d7d9bb7a9b26160ab88f976e7084951110f8210966` |
| angular-password-sign-in-web | 8 | `20bb0006bf41335f8388d59ee615c62130b86c47d6054816da5b6ffffcd1ef4f` |
| angular-password-sign-in-web | 10 | `ca3239d03a84ac7440b0a9d7d9bb7a9b26160ab88f976e7084951110f8210966` |
| angular-password-sign-in-web | 13 | `6579caaa1aa7b33f80bcd9dc58af531a38a3bfc4e7b4d4eb7490ef3342106645` |
| angular-password-sign-in-mobile | 2 | `afd865510b9657196a4e70f2a940fb71485b8e7c71268f84cfe9c5cc65a8fc86` |
| angular-password-sign-in-mobile | 11 | `f29eb371e5fdf8dd9fa760be380d9fc7883aa336f094a45c0809293be5ea1032` |
| angular-password-sign-in-mobile | 12 | `e1236d5a6672c5efd5942f0d28c5e0e3f2a91e52ed676c1ffa4ea9c514dad1b1` |
| angular-password-sign-in-mobile | 15 | `2b1aa65c0089e0b2fd7fa5aa8927a32302817184b8b90cc6403f9c0091213480` |
