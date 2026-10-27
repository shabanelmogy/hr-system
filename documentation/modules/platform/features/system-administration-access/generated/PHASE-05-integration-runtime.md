<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Global administration access Phase 05 - Integration and Runtime

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

- **Global administration access cross-platform master review:** `../modules/platform/features/system-administration-access/system-administration-access-review.md` sections 4, 5, 6, 7, 9
- **Global administration access API implementation profile:** `../modules/platform/features/system-administration-access/system-administration-access-api.md` sections 8, 9, 10
- **Global administration access Next.js implementation profile:** `../modules/platform/features/system-administration-access/system-administration-access-web.md` sections 8, 10, 13
- **Global administration access Expo implementation profile:** `../modules/platform/features/system-administration-access/system-administration-access-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| system-administration-access-master | 4 | `a69c6b83cf4513c9051189de306206a99c36ab894ff3c699157a3f4d5b274268` |
| system-administration-access-master | 5 | `bb1cd5d2d45a16f4e668fca2e890241a7bd57100a49f0f91df1fee7f32648be8` |
| system-administration-access-master | 6 | `2629b587e5bb1b3857c3082d606a2495a68b8cd1b6519071abe158531322532e` |
| system-administration-access-master | 7 | `58cc6420bb8c825b4e6edca064742a11a6e5130811be4f92456d8f95a12d4762` |
| system-administration-access-master | 9 | `ae2f25e0e91b95de952ee9b9e026c0ce3a0ed25ffcfb577a03bdc77728ce85ff` |
| system-administration-access-api | 8 | `309d8d180ca02d2c3eb921de0e2f0f45b42e1431f27a5fc8df80dae139cfa537` |
| system-administration-access-api | 9 | `ae2f25e0e91b95de952ee9b9e026c0ce3a0ed25ffcfb577a03bdc77728ce85ff` |
| system-administration-access-api | 10 | `ebba736b456d2363c58da24a7d2cac79e48605c0f8ea29780d2f3c40f26c98a0` |
| system-administration-access-web | 8 | `309d8d180ca02d2c3eb921de0e2f0f45b42e1431f27a5fc8df80dae139cfa537` |
| system-administration-access-web | 10 | `ebba736b456d2363c58da24a7d2cac79e48605c0f8ea29780d2f3c40f26c98a0` |
| system-administration-access-web | 13 | `bae17b25e79f16860f2e16ff91d0820faf9bc295439f430aa2a491853c65ac8f` |
| system-administration-access-mobile | 2 | `ad63af066c8d004e6c8bb5e73e66f44a8801d95b7577321e5b9f4da9b8b9320a` |
| system-administration-access-mobile | 11 | `27b43263e6a89be6211323dd828db1627d4e4b13981c9f76424aefb3e5d49a69` |
| system-administration-access-mobile | 12 | `c600d8df7d364e5b7d61ca358cf0cef1c7f4bbe58855120ac57189e131cda717` |
| system-administration-access-mobile | 15 | `f233b4fde169c8c74f50ccd6753ab6cfd93bb3ac99c555f809954dac2e86403c` |
