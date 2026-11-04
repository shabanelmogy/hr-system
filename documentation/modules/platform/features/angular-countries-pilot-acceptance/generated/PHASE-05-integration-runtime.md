<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Countries complete Angular pilot acceptance Phase 05 - Integration and Runtime

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

- **Countries complete Angular pilot acceptance cross-platform master review:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-review.md` sections 4, 5, 6, 7, 9
- **Countries complete Angular pilot acceptance API implementation profile:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-api.md` sections 8, 9, 10
- **Countries complete Angular pilot acceptance Angular implementation profile:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-web.md` sections 8, 10, 13
- **Countries complete Angular pilot acceptance Expo implementation profile:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-pilot-acceptance-master | 4 | `c2f924e767e6c47bb155a02081c795e3c9aa9c9353c65741237a4cc9cbd6ab42` |
| angular-countries-pilot-acceptance-master | 5 | `0aa6952a87771c8a709da41f5b1a7175e04ded9b8b5e5920427a65f6ae684b29` |
| angular-countries-pilot-acceptance-master | 6 | `5fa79433edfee936f81b6259cb61c3c72bd3795b68c54b038bb614b08ca4d730` |
| angular-countries-pilot-acceptance-master | 7 | `a0871f0deb9d51fd5188b394318ddd8452ad5c770fb4b980cd4c32e02958aac9` |
| angular-countries-pilot-acceptance-master | 9 | `cfd45c94e6f6655bf42151bf457b3a824ed4ea45c44bc9133a0b327d6f1c70f2` |
| angular-countries-pilot-acceptance-api | 8 | `8ff9f73d158c003b1de9fa565cc3db69c532b5fa764765f86113ecc3c93907f6` |
| angular-countries-pilot-acceptance-api | 9 | `cfd45c94e6f6655bf42151bf457b3a824ed4ea45c44bc9133a0b327d6f1c70f2` |
| angular-countries-pilot-acceptance-api | 10 | `62c2258966b5f7bbae277f33d4fdec00a34d1794d5e048e1c3c2a80d3e237a0d` |
| angular-countries-pilot-acceptance-web | 8 | `8ff9f73d158c003b1de9fa565cc3db69c532b5fa764765f86113ecc3c93907f6` |
| angular-countries-pilot-acceptance-web | 10 | `62c2258966b5f7bbae277f33d4fdec00a34d1794d5e048e1c3c2a80d3e237a0d` |
| angular-countries-pilot-acceptance-web | 13 | `9966dbeaa235bbbbfeef2d945a6b229644b05050df48a7fc67067bbc73f18f4f` |
| angular-countries-pilot-acceptance-mobile | 2 | `fa3d7dae26a2a2723af52b2fb6d47134773511ad0f0073db0dfda826cdca7f8b` |
| angular-countries-pilot-acceptance-mobile | 11 | `6282d9e0aadf0205a7879543ba007e253c4fc0580578ea83e1ccfc29af98b94c` |
| angular-countries-pilot-acceptance-mobile | 12 | `49e888ac56d99f7874e3f4b067ed086c71f4c289959b89f9c58d70ba536bedb8` |
| angular-countries-pilot-acceptance-mobile | 15 | `8da7404d2323ae2e158b4f744ce85ada57c5fed0ed0eeaf6b5446ea4c4d841f1` |
