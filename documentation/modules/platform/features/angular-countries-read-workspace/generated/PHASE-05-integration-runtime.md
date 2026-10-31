<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Countries read workspace Phase 05 - Integration and Runtime

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

- **Countries read workspace cross-platform master review:** `../modules/platform/features/angular-countries-read-workspace/angular-countries-read-workspace-review.md` sections 4, 5, 6, 7, 9
- **Countries read workspace API implementation profile:** `../modules/platform/features/angular-countries-read-workspace/angular-countries-read-workspace-api.md` sections 8, 9, 10
- **Countries read workspace Next.js implementation profile:** `../modules/platform/features/angular-countries-read-workspace/angular-countries-read-workspace-web.md` sections 8, 10, 13
- **Countries read workspace Expo implementation profile:** `../modules/platform/features/angular-countries-read-workspace/angular-countries-read-workspace-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-read-workspace-master | 4 | `73f5a7101a9e9f4423d8539c612013ba7eb1541d388fb44669919a8f2779bc62` |
| angular-countries-read-workspace-master | 5 | `3704acfa0146fdc1b48ca9f3465476082e5cce31454a7ab150b2149b60faf524` |
| angular-countries-read-workspace-master | 6 | `4aa2e516e6ef412cfb58f2d8ccc71961358af0545fb78f9128ec63fdfa43b512` |
| angular-countries-read-workspace-master | 7 | `20af956b014674166cbc688b3813fff95ab1ed9a22bc27580172876834718601` |
| angular-countries-read-workspace-master | 9 | `9956bd77de0553081068027e0cf412fb7f2ac7d411995786f17e1f2d5ddd6c6d` |
| angular-countries-read-workspace-api | 8 | `9c477e9921fce73d5b4db42fb8fd55aa1152683205584719fbec91024291702d` |
| angular-countries-read-workspace-api | 9 | `9956bd77de0553081068027e0cf412fb7f2ac7d411995786f17e1f2d5ddd6c6d` |
| angular-countries-read-workspace-api | 10 | `351549c64b8a2862ebda6e01484037ddf3730522101fa8d1379a763aceb43ac9` |
| angular-countries-read-workspace-web | 8 | `9c477e9921fce73d5b4db42fb8fd55aa1152683205584719fbec91024291702d` |
| angular-countries-read-workspace-web | 10 | `351549c64b8a2862ebda6e01484037ddf3730522101fa8d1379a763aceb43ac9` |
| angular-countries-read-workspace-web | 13 | `a8e9fd7982be74fdc8e110741f94b12dc5c62d1d09f8ee17bb693688ff380700` |
| angular-countries-read-workspace-mobile | 2 | `51f1e1d285b87461fffb80a80d433a26b836b3b254d99b2ede854d698aa9cc1e` |
| angular-countries-read-workspace-mobile | 11 | `66b7842c53fe3f6e2ca4d73e4eb31426c01e65b6f00d8e86203decd1cb992e3f` |
| angular-countries-read-workspace-mobile | 12 | `1cc54745e63db3c14506da98e699afb0791a712984bb578523300f0d20e5fd06` |
| angular-countries-read-workspace-mobile | 15 | `4233fa4c8da11c5f8abde54a33d133420fdeb7db0319db79f6e379c4f5acf39a` |
