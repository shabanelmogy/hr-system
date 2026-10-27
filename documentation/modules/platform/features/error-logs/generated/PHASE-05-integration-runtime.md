<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Error Logs Phase 05 - Integration and Runtime

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

- **Error Logs cross-platform master review:** `../modules/platform/features/error-logs/error-logs-review.md` sections 4, 5, 6, 7, 9
- **Error Logs API implementation profile:** `../modules/platform/features/error-logs/error-logs-api.md` sections 8, 9, 10
- **Error Logs Next.js implementation profile:** `../modules/platform/features/error-logs/error-logs-web.md` sections 8, 10, 13
- **Error Logs Expo implementation profile:** `../modules/platform/features/error-logs/error-logs-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| error-logs-master | 4 | `b2c5336b615e80ae9ddb993d4506bda33f4d1ddd4d132280a8baf4e1cda3163a` |
| error-logs-master | 5 | `7a33d78dc7db935d033562e6979e33656e4139b190e036ee794f86c105724d84` |
| error-logs-master | 6 | `fd16df7662f5aee4c4df61b0f350e005f1c2cbdde6933cc61c30fe6287931107` |
| error-logs-master | 7 | `8ab6dbea01784875b50c966894f345e7f266562d5bf01ddb80ce3fc784f2a08f` |
| error-logs-master | 9 | `a312c0d75748613e1211c45ca12f36b9301da6351b767a155842e4d3805fdde2` |
| error-logs-api | 8 | `796b04653e5f28dd3f58cbb913eaded3782fee609b2ebc3447d104216260a8e7` |
| error-logs-api | 9 | `fd66fc91d6b3db00b806d98822d6ecfd91a3ef40afa0dc0d9e542a0e371c3301` |
| error-logs-api | 10 | `d16950140d836904e3957898dce0e346d653d0e2d56d96ead2dce8e7b8441deb` |
| error-logs-web | 8 | `b9db19550a59947a1a4f0e1c2afc14d157fd739f26d499ef98a7a5ad2f2c7bfd` |
| error-logs-web | 10 | `f5f4b4eab40dab0e458943fe2d38666a9e595800ac56a955298b7c04919e2ad8` |
| error-logs-web | 13 | `70c1d560d59f053e995f7ba8763d983b27add4a4f2c7f1f8f958e70a96aeba68` |
| error-logs-mobile | 2 | `39a4d4d016245422304ba49c8161491afb2fb682a3e80ec7d2a0f75af930230e` |
| error-logs-mobile | 11 | `c9fd373ffb35d90394b35bbf94ded27f3e475bd9ab534ad6c1d81c6ee0356953` |
| error-logs-mobile | 12 | `b5d6946713e36c3c0722723c58642555942cde0826c8394f696a8aa6de9b89f5` |
| error-logs-mobile | 15 | `a2c02fdf982479cc77b45557380f82360d5b03c62029674e8fdf45ff9efa005e` |
