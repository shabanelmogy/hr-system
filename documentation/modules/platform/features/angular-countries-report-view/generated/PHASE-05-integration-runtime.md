<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Countries managed report integration Phase 05 - Integration and Runtime

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

- **Countries managed report integration cross-platform master review:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-review.md` sections 4, 5, 6, 7, 9
- **Countries managed report integration API implementation profile:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-api.md` sections 8, 9, 10
- **Countries managed report integration Next.js implementation profile:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-web.md` sections 8, 10, 13
- **Countries managed report integration Expo implementation profile:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-report-view-master | 4 | `3b38fdb0f0c035d49d625c0ef5925ea5dab689790a0e902b6d14455d457ffc2e` |
| angular-countries-report-view-master | 5 | `43b959cae6bb10e1d9bcf2e172b2478bedb17a95f07dcf801fdebabb55016a2b` |
| angular-countries-report-view-master | 6 | `97a7a27cdc275344b63b9f89e0a89f42c54f4857f207cb9029e9302d425ae8fc` |
| angular-countries-report-view-master | 7 | `bdc28a44e43d6e2dcd0c2e5e7701abcf746b167b32fc8e7a63d34a0c9d7c1ef8` |
| angular-countries-report-view-master | 9 | `0215aed4368565042ad4967e981f04b00180df8b9b530c8e779be74fb01b3b98` |
| angular-countries-report-view-api | 8 | `7b60972b45ea2acdcdca1d0674b119b26fa40d043d89416c6df3796537de9fc8` |
| angular-countries-report-view-api | 9 | `0215aed4368565042ad4967e981f04b00180df8b9b530c8e779be74fb01b3b98` |
| angular-countries-report-view-api | 10 | `13d60bdce102af4d3de471b1c12d188b22f6defca177537ecb29b0a236150bca` |
| angular-countries-report-view-web | 8 | `7b60972b45ea2acdcdca1d0674b119b26fa40d043d89416c6df3796537de9fc8` |
| angular-countries-report-view-web | 10 | `13d60bdce102af4d3de471b1c12d188b22f6defca177537ecb29b0a236150bca` |
| angular-countries-report-view-web | 13 | `70cc223c7e0e082bc94d8dc214ce9a5a1cc7d1692876327bd4cf761090c4e345` |
| angular-countries-report-view-mobile | 2 | `1abd6291624d06e3d1f34333891ca796a9e00f8aa20cacadf888cd301df5a66b` |
| angular-countries-report-view-mobile | 11 | `07d4a23ab10ebc939015f30437df95f269e1947926ae9878cceb0fd53cf1d7f2` |
| angular-countries-report-view-mobile | 12 | `d00ef73c695843a04a35e438f8baf2757d912e610092d13ab610d3e29eaf9625` |
| angular-countries-report-view-mobile | 15 | `77e437514d564ff8e9a24ba924f71ab6918acd8ba106c5c08f9577b533b90aa7` |
