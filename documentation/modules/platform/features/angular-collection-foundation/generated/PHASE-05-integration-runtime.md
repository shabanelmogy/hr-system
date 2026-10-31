<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Angular shared collection foundation Phase 05 - Integration and Runtime

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

- **Angular shared collection foundation cross-platform master review:** `../modules/platform/features/angular-collection-foundation/angular-collection-foundation-review.md` sections 4, 5, 6, 7, 9
- **Angular shared collection foundation API implementation profile:** `../modules/platform/features/angular-collection-foundation/angular-collection-foundation-api.md` sections 8, 9, 10
- **Angular shared collection foundation Angular web implementation profile:** `../modules/platform/features/angular-collection-foundation/angular-collection-foundation-web.md` sections 8, 10, 13
- **Angular shared collection foundation Expo implementation profile:** `../modules/platform/features/angular-collection-foundation/angular-collection-foundation-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-collection-foundation-master | 4 | `3846922f56bb2f0dd5bc8f55b5c64f733b425d1ea2943bd56ea4c708751fc849` |
| angular-collection-foundation-master | 5 | `eb41e60b3ccb7bff3e9779fbd2fae7ffbb4abe217a04bb29cd5b42cbcf12b7f1` |
| angular-collection-foundation-master | 6 | `983ed69fcd0a2160a70725c73120734deec395f8025415ca5e46661d4fec6f25` |
| angular-collection-foundation-master | 7 | `5641f423c2c6f22020977d5980a19cea09f05fc56824c8f37a5db50819dfc9a1` |
| angular-collection-foundation-master | 9 | `72b4e325040d35ad3426bf2fc0686fa85b299e5f2e349735a570c0cd93a88e25` |
| angular-collection-foundation-api | 8 | `c5930c59d67c5efccc1bda1aba04bdacb2ce11cb936ddfb4306e541ee2a782af` |
| angular-collection-foundation-api | 9 | `72b4e325040d35ad3426bf2fc0686fa85b299e5f2e349735a570c0cd93a88e25` |
| angular-collection-foundation-api | 10 | `7653f373d77818eab834faf40a1877d9492456d68d7394c81de97df13dc9c17b` |
| angular-collection-foundation-web | 8 | `c5930c59d67c5efccc1bda1aba04bdacb2ce11cb936ddfb4306e541ee2a782af` |
| angular-collection-foundation-web | 10 | `7653f373d77818eab834faf40a1877d9492456d68d7394c81de97df13dc9c17b` |
| angular-collection-foundation-web | 13 | `22c80fdb52fd1cf880f807ef351f9851f394bfa956c756b6ec4e84e9e22128a1` |
| angular-collection-foundation-mobile | 2 | `ab50d090b58609d2bd08a52ba5b40d1e7769f63398e9370d31c02347f9a60078` |
| angular-collection-foundation-mobile | 11 | `900f3d8706f3bbad21a81d915d3c5e875b5862f8c4f8df0f37d9834504346239` |
| angular-collection-foundation-mobile | 12 | `01f711480bf46a59884a1c0ef5ecf9efadacc73f531d0c69236f14d5b91e43e9` |
| angular-collection-foundation-mobile | 15 | `9088a7ed9203940469f0bda4a96bae95ef7ff7144ef4d527d137fe7d1ce09932` |
