<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Managed reporting adapter preparation Phase 05 - Integration and Runtime

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

- **Managed reporting adapter preparation cross-platform master review:** `../modules/platform/features/angular-managed-reporting-adapter/angular-managed-reporting-adapter-review.md` sections 4, 5, 6, 7, 9
- **Managed reporting adapter preparation API implementation profile:** `../modules/platform/features/angular-managed-reporting-adapter/angular-managed-reporting-adapter-api.md` sections 8, 9, 10
- **Managed reporting adapter preparation Next.js implementation profile:** `../modules/platform/features/angular-managed-reporting-adapter/angular-managed-reporting-adapter-web.md` sections 8, 10, 13
- **Managed reporting adapter preparation Expo implementation profile:** `../modules/platform/features/angular-managed-reporting-adapter/angular-managed-reporting-adapter-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-managed-reporting-adapter-master | 4 | `0d75a0cc98ed3a106e8343d19526c34b38a8aa4ce019633d33510a6df070b725` |
| angular-managed-reporting-adapter-master | 5 | `6241b5fb0db88e111491eed08e0dcb92e8386fe3b26867510d4cd5f29f7d3d2b` |
| angular-managed-reporting-adapter-master | 6 | `7ddf91640d39b54272167893efb83e1111050dce8b98d44d9b1a94e99b53523f` |
| angular-managed-reporting-adapter-master | 7 | `6cef15e087ca9135e2e920cff1c04ee79be87ad22f23806e486bd03344b31515` |
| angular-managed-reporting-adapter-master | 9 | `134f6c9e94fe56442f0bda990b5c3b4f33cdaf72115b8973b40c9ebec4fc79fa` |
| angular-managed-reporting-adapter-api | 8 | `ccd65bd62ffc69968dd25b5533dce7903889333438951fd55ff4f1fcf34a15a4` |
| angular-managed-reporting-adapter-api | 9 | `134f6c9e94fe56442f0bda990b5c3b4f33cdaf72115b8973b40c9ebec4fc79fa` |
| angular-managed-reporting-adapter-api | 10 | `36f180ef4c51ad92659ec0c8848c07e2636ccbb9bb6c3b1f12d982b41b09d353` |
| angular-managed-reporting-adapter-web | 8 | `ccd65bd62ffc69968dd25b5533dce7903889333438951fd55ff4f1fcf34a15a4` |
| angular-managed-reporting-adapter-web | 10 | `36f180ef4c51ad92659ec0c8848c07e2636ccbb9bb6c3b1f12d982b41b09d353` |
| angular-managed-reporting-adapter-web | 13 | `8a83e45d2d2ea70f6e4e9f34106b8ce0f8347ca89327a8b1c7a85bd7eab05d39` |
| angular-managed-reporting-adapter-mobile | 2 | `bfad8afecaea948e75f03de736c5379d100b426827cb85889e5f14898235baae` |
| angular-managed-reporting-adapter-mobile | 11 | `93a24091f3b77bb5313d74a69e82a8bf121d35d9a343c8278f1ff6ba6c4715ad` |
| angular-managed-reporting-adapter-mobile | 12 | `f1a8ba2d63f73fe51ffa57f075322ec2a4b498d29271bc027422f993541bbdda` |
| angular-managed-reporting-adapter-mobile | 15 | `6b4f9dac35863f1038ce7d76086bddc0e118956ed9b494644efecc95b5df8065` |
