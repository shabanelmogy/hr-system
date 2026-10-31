<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Shared numeric field preparation Phase 05 - Integration and Runtime

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

- **Shared numeric field preparation cross-platform master review:** `../modules/platform/features/angular-numeric-field-foundation/angular-numeric-field-foundation-review.md` sections 4, 5, 6, 7, 9
- **Shared numeric field preparation API implementation profile:** `../modules/platform/features/angular-numeric-field-foundation/angular-numeric-field-foundation-api.md` sections 8, 9, 10
- **Shared numeric field preparation Next.js implementation profile:** `../modules/platform/features/angular-numeric-field-foundation/angular-numeric-field-foundation-web.md` sections 8, 10, 13
- **Shared numeric field preparation Expo implementation profile:** `../modules/platform/features/angular-numeric-field-foundation/angular-numeric-field-foundation-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-numeric-field-foundation-master | 4 | `edd3f9b373462b8ac2e64a379419a7edef45614e218a0945bee7f04a1b1c1ff9` |
| angular-numeric-field-foundation-master | 5 | `154795d81507bf30a922336b9c6d501fed92fa3a543520746a1f5b2712a86510` |
| angular-numeric-field-foundation-master | 6 | `90b3b447db8e251821cbabd42393b6d0c97cc58f0052d655106388445265d12c` |
| angular-numeric-field-foundation-master | 7 | `11121dae5fcc238d7bb7f4cc47b7e1327f9537faa434a5060adf9297b801985d` |
| angular-numeric-field-foundation-master | 9 | `ce837fa5be7fa391f4de61e5ec453337c57b3171ba9948aa2f36bebc0ceaf8d0` |
| angular-numeric-field-foundation-api | 8 | `cf660dea88733a16bc9c17ce4231c1fba6e5afc89865ef26e10d334ba735be9a` |
| angular-numeric-field-foundation-api | 9 | `ce837fa5be7fa391f4de61e5ec453337c57b3171ba9948aa2f36bebc0ceaf8d0` |
| angular-numeric-field-foundation-api | 10 | `0bd7827ed769528e2ab4bb6c555c68c6ba376f2c580ed0da78d2aaba1aeae03c` |
| angular-numeric-field-foundation-web | 8 | `cf660dea88733a16bc9c17ce4231c1fba6e5afc89865ef26e10d334ba735be9a` |
| angular-numeric-field-foundation-web | 10 | `0bd7827ed769528e2ab4bb6c555c68c6ba376f2c580ed0da78d2aaba1aeae03c` |
| angular-numeric-field-foundation-web | 13 | `260b6bbb722334d7f00f2ce0e9832a63fff0dce90b143b8ab2bc33d35f62ddf1` |
| angular-numeric-field-foundation-mobile | 2 | `414f2867556665bcb83f2f1ed4794d3185f8f25b5100ebaa9f80e127a10cb98b` |
| angular-numeric-field-foundation-mobile | 11 | `c05dd60d5967720bf86a0cf631db3fd61c433ee0edb31e9aacf9fe38cfc97bcc` |
| angular-numeric-field-foundation-mobile | 12 | `70c394f21d68ed7b27d6a603691fc12f698a32daa54587498947440364873013` |
| angular-numeric-field-foundation-mobile | 15 | `01d2ce9fe177a828ba7704a0c32938e72850f349533cfcedbfa5736d03335bb4` |
