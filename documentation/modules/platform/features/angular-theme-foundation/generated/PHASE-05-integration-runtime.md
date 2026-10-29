<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Angular Shared Theme and Action Control Phase 05 - Integration and Runtime

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

- **Angular Shared Theme and Action Control cross-platform master review:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-review.md` sections 4, 5, 6, 7, 9
- **Angular Shared Theme and Action Control API implementation profile:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-api.md` sections 8, 9, 10
- **Angular Shared Theme and Action Control Next.js implementation profile:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-web.md` sections 8, 10, 13
- **Angular Shared Theme and Action Control Expo implementation profile:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-theme-foundation-master | 4 | `da77c409251d42150cbb611b466e34269a36e417e5afd3890a68836bf33243eb` |
| angular-theme-foundation-master | 5 | `a866a4bf9fdc929bfb990a70fe575bfc962a4097a68f81e636044e80f620d8d1` |
| angular-theme-foundation-master | 6 | `c59b87b10fc969391f2d782547421b84c7d4b47bdf19df5f2b8485949b709791` |
| angular-theme-foundation-master | 7 | `74ab13bcbd7d84010d64cac92472527044e747aca5045560ab602ee00fb3a1d8` |
| angular-theme-foundation-master | 9 | `5291c967ab5ed5d278ffe583e1ff21d682be39afc96fb69800728b7da653b36b` |
| angular-theme-foundation-api | 8 | `ea5867fdb4129cd10c2ee5662de83461d5cad88059d0057d0977147a1f1c022d` |
| angular-theme-foundation-api | 9 | `5291c967ab5ed5d278ffe583e1ff21d682be39afc96fb69800728b7da653b36b` |
| angular-theme-foundation-api | 10 | `62ccb5d14f2b568616a3cf694d0418404fd96766ba7ca2f3a10538da44834953` |
| angular-theme-foundation-web | 8 | `ea5867fdb4129cd10c2ee5662de83461d5cad88059d0057d0977147a1f1c022d` |
| angular-theme-foundation-web | 10 | `62ccb5d14f2b568616a3cf694d0418404fd96766ba7ca2f3a10538da44834953` |
| angular-theme-foundation-web | 13 | `13bc8ce32880ebc4901c2ccf67f921e1a34fcffa5dbb2bf3f3e08566adaa8a61` |
| angular-theme-foundation-mobile | 2 | `23ebd67dc023b93e3fe4b46bf2d361346ae97d9e9e774aa289e82f4ec0584f7b` |
| angular-theme-foundation-mobile | 11 | `58dc115e8092bcba8eba15cea9974b490796f1bb79ea8dcb5f57f9f9083b5e13` |
| angular-theme-foundation-mobile | 12 | `1551bbf6ddbdcd426aa3759d7ced8fdf0a303c7a5143aba86a4c6e5870592c4b` |
| angular-theme-foundation-mobile | 15 | `352a451bf107a65df616afa4f9d3d8396b7bfa7bd25b5f00b26f68687a0319ba` |
