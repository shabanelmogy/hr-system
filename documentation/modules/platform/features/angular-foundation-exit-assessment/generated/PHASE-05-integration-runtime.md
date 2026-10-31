<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Foundation exit and pilot readiness assessment Phase 05 - Integration and Runtime

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

- **Foundation exit and pilot readiness assessment cross-platform master review:** `../modules/platform/features/angular-foundation-exit-assessment/angular-foundation-exit-assessment-review.md` sections 4, 5, 6, 7, 9
- **Foundation exit and pilot readiness assessment API implementation profile:** `../modules/platform/features/angular-foundation-exit-assessment/angular-foundation-exit-assessment-api.md` sections 8, 9, 10
- **Foundation exit and pilot readiness assessment Next.js implementation profile:** `../modules/platform/features/angular-foundation-exit-assessment/angular-foundation-exit-assessment-web.md` sections 8, 10, 13
- **Foundation exit and pilot readiness assessment Expo implementation profile:** `../modules/platform/features/angular-foundation-exit-assessment/angular-foundation-exit-assessment-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-foundation-exit-assessment-master | 4 | `ef1886603d2b739301c6583a472a3a32660fb656e28205f44378bd185952df7a` |
| angular-foundation-exit-assessment-master | 5 | `25cc0fdd99b871c548937b062151de690f320e28a2b4cb992754e45fe5dbae61` |
| angular-foundation-exit-assessment-master | 6 | `fbfe8ff363cfd32471333529d87cb118044ec7b76590705a0f08139b4b04006a` |
| angular-foundation-exit-assessment-master | 7 | `574b028cc3d8b969e4c433ba7f95e864d61fa8441914bc22adb2a275213a7fc0` |
| angular-foundation-exit-assessment-master | 9 | `5617cac65bbfa4d8cf8a167359903eb51c4ab7ef68f1fcfc00cb268848e0c8a4` |
| angular-foundation-exit-assessment-api | 8 | `a68ecda2bfe01f209cbb52e0793eaeb7d6966de6a5c17412d244ec9fdfc9f3ce` |
| angular-foundation-exit-assessment-api | 9 | `5617cac65bbfa4d8cf8a167359903eb51c4ab7ef68f1fcfc00cb268848e0c8a4` |
| angular-foundation-exit-assessment-api | 10 | `dfd965d7afe5fffcff2d3df939f8447b6070c5a7bf56d76963ec3b264ede0f5f` |
| angular-foundation-exit-assessment-web | 8 | `a68ecda2bfe01f209cbb52e0793eaeb7d6966de6a5c17412d244ec9fdfc9f3ce` |
| angular-foundation-exit-assessment-web | 10 | `dfd965d7afe5fffcff2d3df939f8447b6070c5a7bf56d76963ec3b264ede0f5f` |
| angular-foundation-exit-assessment-web | 13 | `ad1e70fd9e3fda8329f14c174716f62e03fee38c52f04284521ce671c894995b` |
| angular-foundation-exit-assessment-mobile | 2 | `a73ce6b46bce9f34ed00180d86d88be490d97104fa2cd668ebd21e7b405af207` |
| angular-foundation-exit-assessment-mobile | 11 | `a41f7ddf6804f9ac73e341369b1de373fd3da999c0fc5948788176cc586e1e87` |
| angular-foundation-exit-assessment-mobile | 12 | `4e3e136533d711dc2b1944d65a953ef4885f1b7b00a44335da47fe4e8cc5bb71` |
| angular-foundation-exit-assessment-mobile | 15 | `f22a993e7f41983c616e3516d2c5b0e9dbe3a677d9272e7c25722584d5b4be72` |
