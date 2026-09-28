<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Managed Crystal Report Manager Experience Phase 05 - Integration and Runtime

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

- **Managed Crystal Report Manager Experience cross-platform master review:** `../project/MANAGED_CRYSTAL_MANAGER_EXPERIENCE_FEATURE_FULL_REVIEW.md` sections 4, 5, 6, 7, 9
- **Managed Crystal Report Manager Experience API implementation profile:** `../api/ManagedCrystalManagerExperience_API_Implementation_Profile.md` sections 8, 9, 10
- **Managed Crystal Report Manager Experience Next.js implementation profile:** `../web-next/features/managed-crystal-manager-experience-frontend-reference.md` sections 8, 10, 13
- **Managed Crystal Report Manager Experience Expo implementation profile:** `../mobile-react/managed-crystal-manager-experience-mobile-reference.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-manager-experience-master | 4 | `100d6ff5f514f29fc9f2c4283571b3649c9fcb92cf3274b437126efe403b107f` |
| managed-crystal-manager-experience-master | 5 | `8e5ec68fb4bc3432ce57f1ef4942c19edf59c4154ae1e2465f37b46a69823c5a` |
| managed-crystal-manager-experience-master | 6 | `11acfb50331a9258f4cb84c91af1c2919d9caddfde1af01db9b0e1de4445311d` |
| managed-crystal-manager-experience-master | 7 | `cae2d057019488500bdc6fa7854889c1394d4d219864d534b6064680d3cffb1a` |
| managed-crystal-manager-experience-master | 9 | `b3f632e92be51b9dd07d47a5d300530d9e47275faf6cf87fab0863e2588e803e` |
| managed-crystal-manager-experience-api | 8 | `dfe2d1e952c76df4b242c1b5540f1f202e05a2e66ac20a135f5b2baed6d4f991` |
| managed-crystal-manager-experience-api | 9 | `94b91385cc20a0468c42bd7bf47471c6638f34c7a09689e1df5247db93f8a764` |
| managed-crystal-manager-experience-api | 10 | `0ab127d92eedad1d1ff51c9c541f6b29fa5c2a243e44b342e16621429344f2c4` |
| managed-crystal-manager-experience-web | 8 | `804054f9ca706bc227203f5323086261dd587f0b2d89d3f6ab6ece0f411226cf` |
| managed-crystal-manager-experience-web | 10 | `0cb8bf3805cf377074eaf0044ef2e2d3048ceb8a5de631590a074b40a1b00424` |
| managed-crystal-manager-experience-web | 13 | `559cf90a7ec238f7ea97e465dac3b38fe2a2dbb9bf3c2f178ad6f935dd335903` |
| managed-crystal-manager-experience-mobile | 2 | `aea443fe72612197e12c8c1c6457782bfbcab024ab6d1411f789a28ac54cef2e` |
| managed-crystal-manager-experience-mobile | 11 | `a8228f8a355cef3bc39fa8cf713120e24ef90ac0b2c059ffaa5dede3f2d7bb03` |
| managed-crystal-manager-experience-mobile | 12 | `dabaad871ebdc616ca5d5d6be95085971c684aa2576ca16e5d00feb72c892f5e` |
| managed-crystal-manager-experience-mobile | 15 | `366e849971dc0752669b7e2cc3ab7be575ca93110f72fffbd20fa795fdaa6f8d` |
