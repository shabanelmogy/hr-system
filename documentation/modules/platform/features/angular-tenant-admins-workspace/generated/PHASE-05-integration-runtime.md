<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Super Admin Tenant Administrators parity Phase 05 - Integration and Runtime

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

- **Super Admin Tenant Administrators parity cross-platform master review:** `../modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-review.md` sections 4, 5, 6, 7, 9
- **Super Admin Tenant Administrators parity API implementation profile:** `../modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-api.md` sections 8, 9, 10
- **Super Admin Tenant Administrators parity Next.js implementation profile:** `../modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-web.md` sections 8, 10, 13
- **Super Admin Tenant Administrators parity Expo implementation profile:** `../modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-tenant-admins-workspace-master | 4 | `b312109aea85caea32a57fdcec24284fbf6883425ce0a13e933303f35fe09339` |
| angular-tenant-admins-workspace-master | 5 | `7e28de741932b6bec4bbec7f955d1734316c5b5a58bd5ab6f82944ec6a4c22db` |
| angular-tenant-admins-workspace-master | 6 | `9d15f52db14b58a5e479be4391307c4b6c02b878731e5c7db257054d35ec6378` |
| angular-tenant-admins-workspace-master | 7 | `8d97423ac73482df90ccd0097fcadb37f465d0404d06c39c6e04262004e6c60d` |
| angular-tenant-admins-workspace-master | 9 | `9fc33d645ccd7ddc8a3900ab3265c732e553c5894ab8e2219f201cfe91081800` |
| angular-tenant-admins-workspace-api | 8 | `1e18636edbe60a282f77f2ab441b85f2359c9ea6051fabca7360c592e925719f` |
| angular-tenant-admins-workspace-api | 9 | `9fc33d645ccd7ddc8a3900ab3265c732e553c5894ab8e2219f201cfe91081800` |
| angular-tenant-admins-workspace-api | 10 | `9d9e0e66e19ccb5487a50d725ad157fc49323d97f3e1bc6fd76370ffb0429bb3` |
| angular-tenant-admins-workspace-web | 8 | `1e18636edbe60a282f77f2ab441b85f2359c9ea6051fabca7360c592e925719f` |
| angular-tenant-admins-workspace-web | 10 | `9d9e0e66e19ccb5487a50d725ad157fc49323d97f3e1bc6fd76370ffb0429bb3` |
| angular-tenant-admins-workspace-web | 13 | `2326725837a66e7d8ef635069758f4f59db053ad4033da25ee4a5e5bc857537e` |
| angular-tenant-admins-workspace-mobile | 2 | `99920dbd79c8c9d191ef7c37a64abf24af13da54217b04b7dfd0328f44590f86` |
| angular-tenant-admins-workspace-mobile | 11 | `3184a5fcf173d6e35813758be2a5dac2f5597db2363e9d87eb85cd51d2da6fb3` |
| angular-tenant-admins-workspace-mobile | 12 | `5aa0ce96abf130008a81a0ba63b07ef8c7fadb966cd3d8a16b285f45d2b5edb8` |
| angular-tenant-admins-workspace-mobile | 15 | `02a57254ef009d0a91c8e06a109bc0b76c9bfb52ebdfd97976ec9cf4c1bebc4b` |
