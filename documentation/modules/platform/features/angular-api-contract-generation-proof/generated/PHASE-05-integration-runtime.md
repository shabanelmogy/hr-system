<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Angular API contract generation compatibility proof Phase 05 - Integration and Runtime

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

- **Angular API contract generation compatibility proof cross-platform master review:** `../modules/platform/features/angular-api-contract-generation-proof/angular-api-contract-generation-proof-review.md` sections 4, 5, 6, 7, 9
- **Angular API contract generation compatibility proof API implementation profile:** `../modules/platform/features/angular-api-contract-generation-proof/angular-api-contract-generation-proof-api.md` sections 8, 9, 10
- **Angular API contract generation compatibility proof Next.js implementation profile:** `../modules/platform/features/angular-api-contract-generation-proof/angular-api-contract-generation-proof-web.md` sections 8, 10, 13
- **Angular API contract generation compatibility proof Expo implementation profile:** `../modules/platform/features/angular-api-contract-generation-proof/angular-api-contract-generation-proof-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-api-contract-generation-proof-master | 4 | `4ebed5f2b84b04bec2ea90dd08aa6fd428d9534cfc8ad1276b8ce46da124c4fc` |
| angular-api-contract-generation-proof-master | 5 | `49afe2bb4db3fac02f1d86edf857f1f97125d58e1c256407a86f861ded5c87e7` |
| angular-api-contract-generation-proof-master | 6 | `b41e2c1eb859488b6ed13dca4845ef329fe82644f1c7c230f10482e4e863f650` |
| angular-api-contract-generation-proof-master | 7 | `56aba998ce7ccc78088ecbbcc5605381bfe63186119ea63a85a2b6e20ca68c32` |
| angular-api-contract-generation-proof-master | 9 | `78ce449fad32387d28b10ac190a7b24314efa780388f75ebc4f3cd34c045783e` |
| angular-api-contract-generation-proof-api | 8 | `fd292d3cec432f44bb98aceb506aa1d3f871da0aed1f145d4b1ce14bcd82c541` |
| angular-api-contract-generation-proof-api | 9 | `78ce449fad32387d28b10ac190a7b24314efa780388f75ebc4f3cd34c045783e` |
| angular-api-contract-generation-proof-api | 10 | `90e4bcdbf79b13aab5307175b41a047870abb2e21b858362cb7abed7fb17ffab` |
| angular-api-contract-generation-proof-web | 8 | `fd292d3cec432f44bb98aceb506aa1d3f871da0aed1f145d4b1ce14bcd82c541` |
| angular-api-contract-generation-proof-web | 10 | `90e4bcdbf79b13aab5307175b41a047870abb2e21b858362cb7abed7fb17ffab` |
| angular-api-contract-generation-proof-web | 13 | `8eb209af489cfe780f83e4f1313815475d5f669a5d0b2aee6aab18ab9a4c5edf` |
| angular-api-contract-generation-proof-mobile | 2 | `4175488691af7b51b1d42a1ee43d8077207c2229d6575324f6ef899e2d6c3501` |
| angular-api-contract-generation-proof-mobile | 11 | `d7e05edb39ab6b7b9b9545940088a607a8d779f955d7fba4b7ae748bdf8c6e4d` |
| angular-api-contract-generation-proof-mobile | 12 | `0a0dddd7214cdaa5198c2c9aeb62d830042248f156d067d10f2f4f28891930f5` |
| angular-api-contract-generation-proof-mobile | 15 | `7a363919fa6d3783cc9f713d10f73ad3f5a91d68eabafbce13e95232c0a0ed0b` |
