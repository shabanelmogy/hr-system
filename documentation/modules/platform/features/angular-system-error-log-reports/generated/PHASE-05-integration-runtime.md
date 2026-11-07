<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# System Error Logs managed reports Phase 05 - Integration and Runtime

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

- **System Error Logs managed reports cross-platform master review:** `../modules/platform/features/angular-system-error-log-reports/angular-system-error-log-reports-review.md` sections 4, 5, 6, 7, 9
- **System Error Logs managed reports API implementation profile:** `../modules/platform/features/angular-system-error-log-reports/angular-system-error-log-reports-api.md` sections 8, 9, 10
- **System Error Logs managed reports Next.js implementation profile:** `../modules/platform/features/angular-system-error-log-reports/angular-system-error-log-reports-web.md` sections 8, 10, 13
- **System Error Logs managed reports Expo implementation profile:** `../modules/platform/features/angular-system-error-log-reports/angular-system-error-log-reports-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-error-log-reports-master | 4 | `dae0a8847e44166632877639f7e93fc1a1262ee7002bda5355bcd1760d2c3a68` |
| angular-system-error-log-reports-master | 5 | `3e6d9e67aea112290c14f307c982dc4422ce1797a871b9b987994981f78d8723` |
| angular-system-error-log-reports-master | 6 | `df0dc6ec5bd68ab7fc21c09cee491973d00caacc2610c7aac7123a97cb31fd70` |
| angular-system-error-log-reports-master | 7 | `6b5a31169e46bb252b0ed56eb85abd716a87d874baa33973d080d38a2c31fa71` |
| angular-system-error-log-reports-master | 9 | `1ddff9f3055780218661a25e809c013f8ae479eced425af4ce7f9c803c473ee9` |
| angular-system-error-log-reports-api | 8 | `1ec0e54b3e2444a14359521d9da0f0c59a3c0f17284a40bd3c54369d44a4ae59` |
| angular-system-error-log-reports-api | 9 | `1ddff9f3055780218661a25e809c013f8ae479eced425af4ce7f9c803c473ee9` |
| angular-system-error-log-reports-api | 10 | `bdfecdeaebe5da652531314b0993ce8305ec61732bb2a9c3bc48a95a44ad8702` |
| angular-system-error-log-reports-web | 8 | `1ec0e54b3e2444a14359521d9da0f0c59a3c0f17284a40bd3c54369d44a4ae59` |
| angular-system-error-log-reports-web | 10 | `bdfecdeaebe5da652531314b0993ce8305ec61732bb2a9c3bc48a95a44ad8702` |
| angular-system-error-log-reports-web | 13 | `08f6995929a83ec1ac6c34252634c5243c37e8604893f55ed49a6bc07618bd82` |
| angular-system-error-log-reports-mobile | 2 | `acb734f7fe636701495dc27f6aefd8f51be19fad48557bb58dc1bb66567cc219` |
| angular-system-error-log-reports-mobile | 11 | `aae000f51a6f9b0334a5a5aa321b6e2c6b76c49ea421e9a824f371f1dfee332b` |
| angular-system-error-log-reports-mobile | 12 | `8125463a4a9faf6d1eeda71c0caf1abc750b8a0a9afd80a5440f652e90100fb5` |
| angular-system-error-log-reports-mobile | 15 | `0f99b0d679a29e602977f35588d63f7879a3936a7fa55b7684ea56bb09879e3e` |
