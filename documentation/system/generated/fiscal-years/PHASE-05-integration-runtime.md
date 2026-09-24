<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Fiscal Years Phase 05 - Integration and Runtime

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

- **Fiscal Years cross-platform master review:** `../project/FISCAL_YEARS_FEATURE_FULL_REVIEW.md` sections 4, 5, 6, 7, 9
- **Fiscal Years API implementation profile:** `../api/FiscalYears_API_Implementation_Profile.md` sections 8, 9, 10
- **Fiscal Years Next.js implementation profile:** `../web-next/features/fiscal-years-frontend-reference.md` sections 8, 10, 13
- **Fiscal Years Expo implementation profile:** `../mobile-react/fiscal-years-mobile-reference.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| fiscal-years-master | 4 | `e2521b85856f5b6c1e6f32e24792ae592df4134bee4bdcc4000751481eedce7e` |
| fiscal-years-master | 5 | `e1abf3aaf4d4b0f0f3ca345a38784ec44cf8b79770008348454eabba2ee4c4d8` |
| fiscal-years-master | 6 | `e03953b3fea34d231ad9a922ae587bd21b59920251d27e5d5b70cfc570a01fc8` |
| fiscal-years-master | 7 | `e48e4b393af65084e67296aba09a61bfefd8c5ca257478e14ddb0845a243296e` |
| fiscal-years-master | 9 | `e316a9ba6c23a31f896d4336f2cbf428ef35f63120f7e8f7e9990e46a5e9187d` |
| fiscal-years-api | 8 | `da26f9374d1461299ddd9043d1a72414d6f63e7df4cd8babe579a9c9382cebb2` |
| fiscal-years-api | 9 | `544d5cc0a769e20f76567b5d1560052dfb950882220b506c0f911cdaa22170bf` |
| fiscal-years-api | 10 | `a823f2200f91e5603cc9dcb22e2fa57d513a7442a3485fa03ed8c3ee1fcc5715` |
| fiscal-years-web | 8 | `e46e54a03b71c5d25ea8647727571d4b305e67fae28e541211b08f63c0d0fa79` |
| fiscal-years-web | 10 | `36a625f31bb605fb799c7baadb51aaf8a3c4711816ffe9d70687835cf38b6349` |
| fiscal-years-web | 13 | `f5dc0e405de381f45c3c08fef09d4f52c7d3a996be0d0c005f535d718be57033` |
| fiscal-years-mobile | 2 | `104021a84636098858e2c39aca079d2288b8d27ad6356d8a185339f1771f1484` |
| fiscal-years-mobile | 11 | `52260959e8e4915eb5304aceea135dd4715ff6ff3ded05dacbd3e6be022fab0c` |
| fiscal-years-mobile | 12 | `afa5c7826e4e149a4c527271b8a0c97c0d7014f0572855dd16d824bcac346768` |
| fiscal-years-mobile | 15 | `522ad90680d7bcc4b0e74fef6ccce4a624d8a4f7a77e3a657f5267d85fed041b` |
