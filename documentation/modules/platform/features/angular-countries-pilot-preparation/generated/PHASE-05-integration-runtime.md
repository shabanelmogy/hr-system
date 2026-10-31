<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Countries pilot preparation Phase 05 - Integration and Runtime

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

- **Countries pilot preparation cross-platform master review:** `../modules/platform/features/angular-countries-pilot-preparation/angular-countries-pilot-preparation-review.md` sections 4, 5, 6, 7, 9
- **Countries pilot preparation API implementation profile:** `../modules/platform/features/angular-countries-pilot-preparation/angular-countries-pilot-preparation-api.md` sections 8, 9, 10
- **Countries pilot preparation Next.js implementation profile:** `../modules/platform/features/angular-countries-pilot-preparation/angular-countries-pilot-preparation-web.md` sections 8, 10, 13
- **Countries pilot preparation Expo implementation profile:** `../modules/platform/features/angular-countries-pilot-preparation/angular-countries-pilot-preparation-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-pilot-preparation-master | 4 | `1c73770cd45e7c8c070200ef9519ac7fd1c97478c2fcba4f3cf85560391068c1` |
| angular-countries-pilot-preparation-master | 5 | `d8bd919c83a5678c9ebdddfcf75f989e353d963870222c1a5f116e0f2b20fc5d` |
| angular-countries-pilot-preparation-master | 6 | `63f6cadc90c5b7a65d7ada2d9804750ba56b1b0b45d29aade44d6131b4c38a06` |
| angular-countries-pilot-preparation-master | 7 | `47a9d24047af73aaf314c020f9296502e9d68a99fba5c5869fa3afcd4a60674d` |
| angular-countries-pilot-preparation-master | 9 | `cf8e09d2816484ef5fe1b3d550ed61098cb7739b6e69934182c068724c7fab6b` |
| angular-countries-pilot-preparation-api | 8 | `6de19e9783c84f5dae33a0930b620ad41f23271249357863cc6b5674b112db4e` |
| angular-countries-pilot-preparation-api | 9 | `cf8e09d2816484ef5fe1b3d550ed61098cb7739b6e69934182c068724c7fab6b` |
| angular-countries-pilot-preparation-api | 10 | `99ebce40b5bf08863732dc80464d3f3199aa700b4358f38675af7ba7e1caf6f3` |
| angular-countries-pilot-preparation-web | 8 | `6de19e9783c84f5dae33a0930b620ad41f23271249357863cc6b5674b112db4e` |
| angular-countries-pilot-preparation-web | 10 | `99ebce40b5bf08863732dc80464d3f3199aa700b4358f38675af7ba7e1caf6f3` |
| angular-countries-pilot-preparation-web | 13 | `416c59ea487734c49a1540d2ed034f83c46d37aa68e98c1c1de183b8d88b66c5` |
| angular-countries-pilot-preparation-mobile | 2 | `ef54c6e76fe4a7268ce85507ba52fa3ca1ab5d4a9903be2815811016b72a9ff2` |
| angular-countries-pilot-preparation-mobile | 11 | `d76489077b244af829c6b552caf7e3b93e3292389e9991d164156b42530b0983` |
| angular-countries-pilot-preparation-mobile | 12 | `a2d8cff8774ebb01edf2964ca642abaceb53663ba44331324393623d62edf1ba` |
| angular-countries-pilot-preparation-mobile | 15 | `38375d4db92df52da4cf83a7118215da66b9480f25edf3ae999379a5b5d8f71e` |
