<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Platform Browser Authentication Phase 05 - Integration and Runtime

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

- **Platform Browser Authentication cross-platform master review:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-review.md` sections 4, 5, 6, 7, 9
- **Platform Browser Authentication API implementation profile:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-api.md` sections 8, 9, 10
- **Platform Browser Authentication Next.js implementation profile:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-web.md` sections 8, 10, 13
- **Platform Browser Authentication Expo implementation profile:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| platform-browser-authentication-master | 4 | `0505f838bd9f13d3144554c0ec84c5ede68b9a4c88979c80f6692106e100f94f` |
| platform-browser-authentication-master | 5 | `59011011d1ce9fdaa6364cb22876b53a5304d6e465050642503a7adf35d9c778` |
| platform-browser-authentication-master | 6 | `3f6972c09887aa9b387d77f91d23c2f2e48de37583bdb9cc0506f94dd1d5a8c4` |
| platform-browser-authentication-master | 7 | `6390b0bf66b6037b53e9c024f398ba2c920c21acf87513c7525a99a3815032c9` |
| platform-browser-authentication-master | 9 | `39bcd574836cb653b4a0b876f1ee7450102de9cac328b3f276ad93c4812cdb83` |
| platform-browser-authentication-api | 8 | `26cc4d301319e508521dc58bb8dcd580b32bb021be0b65eb63efb67d48ee244d` |
| platform-browser-authentication-api | 9 | `19ce75cffb7afc5152f3f28adc221e860d2ef8b40eb3c4f3de9357c951ba4c99` |
| platform-browser-authentication-api | 10 | `0e4108d4382344db7c74d76883a2e1b7804947764162e3298fbd32e9cf365e67` |
| platform-browser-authentication-web | 8 | `3b480eab32b081a85dd0a739f8911bf49c01ab5032ce617f1d0330e32e9d0df6` |
| platform-browser-authentication-web | 10 | `e8585061d8db42a2a0a3d2362f56cd0238abb04e8c2637898ba433e003dc9771` |
| platform-browser-authentication-web | 13 | `1cfcfab5d3d3a982db267aaca6a4e6496779a4db82205c9bf95516df07040f0d` |
| platform-browser-authentication-mobile | 2 | `d830b4f3a096cd0ae552b4154e217df9fb96f59defcd268afdf26c5343cec898` |
| platform-browser-authentication-mobile | 11 | `3b9b38136ee9eee63b85e9b06240286b646e8b78f3d34926eaea28e95760c620` |
| platform-browser-authentication-mobile | 12 | `3308fb3907bfc143e813e7885d79a4f0a5deb686d1459079e2f47ef2cbddd72c` |
| platform-browser-authentication-mobile | 15 | `8af0ef3df801ece28afe0c2530e18328fe178388112421d98303da529229d8ee` |
