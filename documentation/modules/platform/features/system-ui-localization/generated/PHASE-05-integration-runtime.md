<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Authorized global UI texts Phase 05 - Integration and Runtime

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

- **Authorized global UI texts cross-platform master review:** `../modules/platform/features/system-ui-localization/system-ui-localization-review.md` sections 4, 5, 6, 7, 9
- **Authorized global UI texts API implementation profile:** `../modules/platform/features/system-ui-localization/system-ui-localization-api.md` sections 8, 9, 10
- **Authorized global UI texts Next.js implementation profile:** `../modules/platform/features/system-ui-localization/system-ui-localization-web.md` sections 8, 10, 13
- **Authorized global UI texts Expo implementation profile:** `../modules/platform/features/system-ui-localization/system-ui-localization-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| system-ui-localization-master | 4 | `70e996ad943b48a5390a7c4448bec7db1c3245527c19f1bd2e3b4f9ae8f265aa` |
| system-ui-localization-master | 5 | `32146820e095b75cf0b9b59dea51a78e31dd718a67a0d9e531bb570544f3cf2b` |
| system-ui-localization-master | 6 | `3bbcb625fb4c308266540a9c24a749a31aaff91d5e1d10ba69d1773f6abcc50a` |
| system-ui-localization-master | 7 | `a8ab3f527bc433b0074537902f6277738ca193373b87064641cebcd110862d9a` |
| system-ui-localization-master | 9 | `b2bb6b54de02f61156ea76e042b7ec1efd6dff331c3a384ecfe59732d9aa0ae9` |
| system-ui-localization-api | 8 | `ab04613f8900e50c021f17ece5784bbd9ff2c8ec0a5ab19e1fa0707c1e8a7437` |
| system-ui-localization-api | 9 | `b2bb6b54de02f61156ea76e042b7ec1efd6dff331c3a384ecfe59732d9aa0ae9` |
| system-ui-localization-api | 10 | `70d00273093757d7ab7466ed0d5ae7e30edafed482e6361c972641ff640741f0` |
| system-ui-localization-web | 8 | `ab04613f8900e50c021f17ece5784bbd9ff2c8ec0a5ab19e1fa0707c1e8a7437` |
| system-ui-localization-web | 10 | `70d00273093757d7ab7466ed0d5ae7e30edafed482e6361c972641ff640741f0` |
| system-ui-localization-web | 13 | `9a80e3d967c027ccc2b484ecfc7447575a1533c2df7a8d01c4e912f2381222c7` |
| system-ui-localization-mobile | 2 | `f0aa58d0765dfab25b550c01883af501545168b881c3d017a8b415053ef17aac` |
| system-ui-localization-mobile | 11 | `7071778ae3aeee3acdf7c4f79c16425f5f3a9b502205a302b7fbc6ba254c3793` |
| system-ui-localization-mobile | 12 | `55a2b31011a77828dcd674c5deb579d8d372c8c4da49a5a3d67a9400bf8227a2` |
| system-ui-localization-mobile | 15 | `349697f373b56dfa6ff1bb4201558e4703a9fc5136a98e343c9e960a593f7140` |
