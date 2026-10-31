<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Angular Accounting Working Fiscal Year Context Phase 05 - Integration and Runtime

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

- **Angular Accounting Working Fiscal Year Context cross-platform master review:** `../modules/platform/features/angular-fiscal-year-context/angular-fiscal-year-context-review.md` sections 4, 5, 6, 7, 9
- **Angular Accounting Working Fiscal Year Context API implementation profile:** `../modules/platform/features/angular-fiscal-year-context/angular-fiscal-year-context-api.md` sections 8, 9, 10
- **Angular Accounting Working Fiscal Year Context Angular web implementation profile:** `../modules/platform/features/angular-fiscal-year-context/angular-fiscal-year-context-web.md` sections 8, 10, 13
- **Angular Accounting Working Fiscal Year Context Expo implementation profile:** `../modules/platform/features/angular-fiscal-year-context/angular-fiscal-year-context-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-fiscal-year-context-master | 4 | `10cc7bacfef82781a35937d2f9c3707560c56ea7880c51cff639a1a9ed9ff201` |
| angular-fiscal-year-context-master | 5 | `759abf819f4a0722c3de342678debdce87e27ea63ae80cd8742619a7fa87fb41` |
| angular-fiscal-year-context-master | 6 | `635c342420a279993389ee092ec0b96324f8769c43dff3798dfc00b0c5bdcc2f` |
| angular-fiscal-year-context-master | 7 | `95aca8b7614b795b9e57bf5a8af30d7b64f01a711d06cb082e2e57d07bf7172d` |
| angular-fiscal-year-context-master | 9 | `936948f2cf78578f94106ac5f860f87c2fe4e4986e3740c23f1dc37963f132f1` |
| angular-fiscal-year-context-api | 8 | `c12e820ddc46305e7cb7da2b70ac8dd234c92fcc7a90576f50b17b92d9a53a12` |
| angular-fiscal-year-context-api | 9 | `936948f2cf78578f94106ac5f860f87c2fe4e4986e3740c23f1dc37963f132f1` |
| angular-fiscal-year-context-api | 10 | `bb2941ee2b55b076a6ff92db814d6388a469f272b33c66f16346b1c6b2fa8ead` |
| angular-fiscal-year-context-web | 8 | `c12e820ddc46305e7cb7da2b70ac8dd234c92fcc7a90576f50b17b92d9a53a12` |
| angular-fiscal-year-context-web | 10 | `bb2941ee2b55b076a6ff92db814d6388a469f272b33c66f16346b1c6b2fa8ead` |
| angular-fiscal-year-context-web | 13 | `829ca6778f3847d87c18fe252e7c87b921a06c00d5ef65b64a7ff4e19796505f` |
| angular-fiscal-year-context-mobile | 2 | `5234c2c14b64c208b69e9e7173adb27a26c5c6f53b270bcb0ab6d943175fc5fa` |
| angular-fiscal-year-context-mobile | 11 | `a4f449a68c7398071ffa4f5a1ae79dac8ca0f517dddebd5d5b9db07e333ca92d` |
| angular-fiscal-year-context-mobile | 12 | `21e42d8f39ad9083f19d1006eec45d703fbe8f2ce4cb6ba12ae12632c7da363d` |
| angular-fiscal-year-context-mobile | 15 | `47a8fa354fec8bbce2ddc352b56c2a75c017f8aecda7be4a33fa9c1b735031b7` |
