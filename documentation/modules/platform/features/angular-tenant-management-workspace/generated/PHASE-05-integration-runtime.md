<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Super Admin Tenant Management parity Phase 05 - Integration and Runtime

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

- **Super Admin Tenant Management parity cross-platform master review:** `../modules/platform/features/angular-tenant-management-workspace/angular-tenant-management-workspace-review.md` sections 4, 5, 6, 7, 9
- **Super Admin Tenant Management parity API implementation profile:** `../modules/platform/features/angular-tenant-management-workspace/angular-tenant-management-workspace-api.md` sections 8, 9, 10
- **Super Admin Tenant Management parity Next.js implementation profile:** `../modules/platform/features/angular-tenant-management-workspace/angular-tenant-management-workspace-web.md` sections 8, 10, 13
- **Super Admin Tenant Management parity Expo implementation profile:** `../modules/platform/features/angular-tenant-management-workspace/angular-tenant-management-workspace-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-tenant-management-workspace-master | 4 | `6f004a4d1cae47b27fae9059cf195fbdc8c3ae0cd6febda4d96530097b4e1fdf` |
| angular-tenant-management-workspace-master | 5 | `ad4f130498346e98da8d392deb8090e53a1038ca1d029a81e2846a7e178d14a6` |
| angular-tenant-management-workspace-master | 6 | `23b6612a7ccff505989ffebc4ea7e74409115e7338fdb71acda5ec577fa52b0c` |
| angular-tenant-management-workspace-master | 7 | `63ae2d8c85d4480f10772a27375b978a1e39594ff8a5363abdff26061f609192` |
| angular-tenant-management-workspace-master | 9 | `aea4c445078d632d1cf855287b49de312c5b558bdd3445fafec0d79842b18490` |
| angular-tenant-management-workspace-api | 8 | `4dd2d9d16d634d5b10a07cee974304b25582a87f5f5cda75232b0a547569ea1b` |
| angular-tenant-management-workspace-api | 9 | `aea4c445078d632d1cf855287b49de312c5b558bdd3445fafec0d79842b18490` |
| angular-tenant-management-workspace-api | 10 | `02c4d5b980a26d07c1d41aa0235b40c3775f2e3a1295ee3e632106610d4545c2` |
| angular-tenant-management-workspace-web | 8 | `4dd2d9d16d634d5b10a07cee974304b25582a87f5f5cda75232b0a547569ea1b` |
| angular-tenant-management-workspace-web | 10 | `02c4d5b980a26d07c1d41aa0235b40c3775f2e3a1295ee3e632106610d4545c2` |
| angular-tenant-management-workspace-web | 13 | `fbf279b1c25c631dc60900c20f12a63d5e2a0d213572f799133bb8c371f74260` |
| angular-tenant-management-workspace-mobile | 2 | `50a7cb62b26caf4563fe62836531cf24a6e453f6b81423f739cddc8cc7c47de9` |
| angular-tenant-management-workspace-mobile | 11 | `53250fa797569e411e501724b0610d4ed1e4597f93355b69546d6d962b58cd76` |
| angular-tenant-management-workspace-mobile | 12 | `f8dea0b4b8b8eb17213011dba17e5ca41bad1a14640514f71e3bd29587c9bf3c` |
| angular-tenant-management-workspace-mobile | 15 | `72e15ecea19763f2792174e9da0a5a80a54d73cd684baa7a092f1f5d59e42daf` |
