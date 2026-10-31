<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Shared unsaved navigation and context protection preparation Phase 05 - Integration and Runtime

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

- **Shared unsaved navigation and context protection preparation cross-platform master review:** `../modules/platform/features/angular-unsaved-navigation-foundation/angular-unsaved-navigation-foundation-review.md` sections 4, 5, 6, 7, 9
- **Shared unsaved navigation and context protection preparation API implementation profile:** `../modules/platform/features/angular-unsaved-navigation-foundation/angular-unsaved-navigation-foundation-api.md` sections 8, 9, 10
- **Shared unsaved navigation and context protection preparation Next.js implementation profile:** `../modules/platform/features/angular-unsaved-navigation-foundation/angular-unsaved-navigation-foundation-web.md` sections 8, 10, 13
- **Shared unsaved navigation and context protection preparation Expo implementation profile:** `../modules/platform/features/angular-unsaved-navigation-foundation/angular-unsaved-navigation-foundation-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-unsaved-navigation-foundation-master | 4 | `2d58c0161cfcb36c86ca393a6a5ec8f098ada807d4d0e96804bafc8983adfa3a` |
| angular-unsaved-navigation-foundation-master | 5 | `a0d875b6c17ba506eff2ec67858ddf6be03398c262c294ffb637a058e753f9b9` |
| angular-unsaved-navigation-foundation-master | 6 | `fd1302a727902105771ff702edcef4fed293c85eb54daa95d9d57f3caf84fa3c` |
| angular-unsaved-navigation-foundation-master | 7 | `df7297b5bc050edb057a770df55d5088be19599dcc6bae960a2f0dd11e02e09c` |
| angular-unsaved-navigation-foundation-master | 9 | `3a1057f037bc3b51ed5b9a18e3318ae5af9cc03b192c60d47ef3a5b817d786aa` |
| angular-unsaved-navigation-foundation-api | 8 | `102e05d9052cbe150f9838d835dcf3236fb078cddb9870e1026195410c01f87e` |
| angular-unsaved-navigation-foundation-api | 9 | `3a1057f037bc3b51ed5b9a18e3318ae5af9cc03b192c60d47ef3a5b817d786aa` |
| angular-unsaved-navigation-foundation-api | 10 | `0b1dd9dc51445c019adb6e53cf01354dd7c27ad536b2fb307472c04731833c0e` |
| angular-unsaved-navigation-foundation-web | 8 | `102e05d9052cbe150f9838d835dcf3236fb078cddb9870e1026195410c01f87e` |
| angular-unsaved-navigation-foundation-web | 10 | `0b1dd9dc51445c019adb6e53cf01354dd7c27ad536b2fb307472c04731833c0e` |
| angular-unsaved-navigation-foundation-web | 13 | `8ee5f72106aec53e2875658413ddfe630ec0c6e0d8a37b120ee2a37ae855a47f` |
| angular-unsaved-navigation-foundation-mobile | 2 | `79e5a97f176aa796f1eafec856bbc2fef44fe4e15909fc9e9a4af11a081d9bdd` |
| angular-unsaved-navigation-foundation-mobile | 11 | `a14108c59792851a8cf0b396c902cc0a064767ad61a7804cdf0b8376b3d983c6` |
| angular-unsaved-navigation-foundation-mobile | 12 | `e8cb9f856bb8cd95cf5c75447012220d34af46d584c29d89ff9e3a5a11a40308` |
| angular-unsaved-navigation-foundation-mobile | 15 | `6554f82533c72d75042157b056e43d7f2961f64ac7446de21fb78f79bf50a49d` |
