<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Angular Role Home Phase 05 - Integration and Runtime

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

- **Angular Role Home cross-platform master review:** `../modules/platform/features/angular-role-home/angular-role-home-review.md` sections 4, 5, 6, 7, 9
- **Angular Role Home API implementation profile:** `../modules/platform/features/angular-role-home/angular-role-home-api.md` sections 8, 9, 10
- **Angular Role Home Angular web implementation profile:** `../modules/platform/features/angular-role-home/angular-role-home-web.md` sections 8, 10, 13
- **Angular Role Home Expo implementation profile:** `../modules/platform/features/angular-role-home/angular-role-home-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-role-home-master | 4 | `0b512f0ad7afaa343b36e43ab0148064b2a42e0dd51f3d682d7de6e0570920e6` |
| angular-role-home-master | 5 | `563cf43ec82636430fe4e20f38f8398ba1e21e6344b16f5d7af85ccd4943fec2` |
| angular-role-home-master | 6 | `e127c53db94b549e9a0839a46884007b0cb45407d19b1f32fe03d7fbc884e21d` |
| angular-role-home-master | 7 | `c1c548649c4b8f25bfa58b9c5e31aff3d5b9dd128868657c9f2295058e414d4d` |
| angular-role-home-master | 9 | `60f9c606d5d26a6f8a4c4dc82559183bcd0269bd903190817574405dbd36670f` |
| angular-role-home-api | 8 | `d28963b7a469ef83b975e057f57db47703ca3b8fd120d21ff3b4b6497b8a656f` |
| angular-role-home-api | 9 | `60f9c606d5d26a6f8a4c4dc82559183bcd0269bd903190817574405dbd36670f` |
| angular-role-home-api | 10 | `1c839c0e89ee2594c02d7b00912de2fcf2e0690ef23d50b52255e5491a33fe20` |
| angular-role-home-web | 8 | `d28963b7a469ef83b975e057f57db47703ca3b8fd120d21ff3b4b6497b8a656f` |
| angular-role-home-web | 10 | `1c839c0e89ee2594c02d7b00912de2fcf2e0690ef23d50b52255e5491a33fe20` |
| angular-role-home-web | 13 | `e55af14d30d5c713f1629c69ece73be17f6f6f02273c21e4a7c067af65869cdc` |
| angular-role-home-mobile | 2 | `b897606c0ca6644b476e0d49a4efb8d0c00b2b42c1b37d8f6282224dcb9ad071` |
| angular-role-home-mobile | 11 | `091fbcbc24ef465bd0fa7e2e1b02611b0ddaca9d52a29c2deb40c8220573e104` |
| angular-role-home-mobile | 12 | `61c9f87d0e0bbe8f149e1ec5f4dd673d136de6fe271eed0177c4ef0c3e7055c4` |
| angular-role-home-mobile | 15 | `ae3d868cb4ab8937d5dc057abf44e72deda56eaf166efd283c40897473b739da` |
