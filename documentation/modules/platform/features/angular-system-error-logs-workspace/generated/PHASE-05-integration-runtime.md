<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Super Admin System Error Logs and Settings parity Phase 05 - Integration and Runtime

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

- **Super Admin System Error Logs and Settings parity cross-platform master review:** `../modules/platform/features/angular-system-error-logs-workspace/angular-system-error-logs-workspace-review.md` sections 4, 5, 6, 7, 9
- **Super Admin System Error Logs and Settings parity API implementation profile:** `../modules/platform/features/angular-system-error-logs-workspace/angular-system-error-logs-workspace-api.md` sections 8, 9, 10
- **Super Admin System Error Logs and Settings parity Angular implementation profile:** `../modules/platform/features/angular-system-error-logs-workspace/angular-system-error-logs-workspace-web.md` sections 8, 10, 13
- **Super Admin System Error Logs and Settings parity Expo implementation profile:** `../modules/platform/features/angular-system-error-logs-workspace/angular-system-error-logs-workspace-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-error-logs-workspace-master | 4 | `ea13c26fe451e25e2389849c6baa46db19db0e2e5818b47fcacd55b3a2281a0c` |
| angular-system-error-logs-workspace-master | 5 | `0882b5ee797d72df822b3a2c64474f56b81c240a86bc3e7e038952b3db0569c4` |
| angular-system-error-logs-workspace-master | 6 | `2e7929211572a0f3804eb9513fa7c0e74a249c19c2f95a606e097aec1e2521ff` |
| angular-system-error-logs-workspace-master | 7 | `84181d820cbe9950ec74ef69e865f89812e40ffd68eaca7532d3106cb9daf506` |
| angular-system-error-logs-workspace-master | 9 | `e98c2390ea74ebb9e125f9ab193cb9ee91f6be26ff2a951666083039aae33ba0` |
| angular-system-error-logs-workspace-api | 8 | `6f43bfd7053bfa065d6f1e2bceb15dc4556e7a92bd21fced18040a30cc8a7845` |
| angular-system-error-logs-workspace-api | 9 | `e98c2390ea74ebb9e125f9ab193cb9ee91f6be26ff2a951666083039aae33ba0` |
| angular-system-error-logs-workspace-api | 10 | `fee1dff779bd0040e0ea1567ddd715c9152f9f2552db2323caf2732ad03c6d0c` |
| angular-system-error-logs-workspace-web | 8 | `6f43bfd7053bfa065d6f1e2bceb15dc4556e7a92bd21fced18040a30cc8a7845` |
| angular-system-error-logs-workspace-web | 10 | `fee1dff779bd0040e0ea1567ddd715c9152f9f2552db2323caf2732ad03c6d0c` |
| angular-system-error-logs-workspace-web | 13 | `fdbb006d3d48d5ad6b83e2df730882633dd79bb9420e888b6a55a49af0c3e3e8` |
| angular-system-error-logs-workspace-mobile | 2 | `a749dd385b666bb616eac51f085fa68edaec20e091f7f3e14c18712f8d4d71c6` |
| angular-system-error-logs-workspace-mobile | 11 | `24d7b0fd035ab332a688f41685fc07897e3643351b53a90c627dfd8403d37d72` |
| angular-system-error-logs-workspace-mobile | 12 | `cb8f7cc1d6276dbb248c5cf26c5e0b4ec1908c4046c4fede247f84ef682b7bb2` |
| angular-system-error-logs-workspace-mobile | 15 | `5fa233a8133ed08729a070c8ce7019ae46f3ae101678ceb4a0bcfc93d16a2409` |
