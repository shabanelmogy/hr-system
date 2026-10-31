<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Countries create and edit workflow Phase 05 - Integration and Runtime

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

- **Countries create and edit workflow cross-platform master review:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-review.md` sections 4, 5, 6, 7, 9
- **Countries create and edit workflow API implementation profile:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-api.md` sections 8, 9, 10
- **Countries create and edit workflow Next.js implementation profile:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-web.md` sections 8, 10, 13
- **Countries create and edit workflow Expo implementation profile:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-edit-workflow-master | 4 | `191dd68f7e834b4f6033d137a3fa9e59fd2a4ca303758d4fbe493e9159690254` |
| angular-countries-edit-workflow-master | 5 | `9e4c812bc1ac25ecc365f17515aaaceb899f41acf26ee693b6411da8de5c18dc` |
| angular-countries-edit-workflow-master | 6 | `181613fc61072107ad666952c73167e3fa398b359d944f7e58d217082463aca3` |
| angular-countries-edit-workflow-master | 7 | `75fe6c506ec73b0cbe3140da9c7cd32ad63a48d247ab8865c78c76e10961c1bf` |
| angular-countries-edit-workflow-master | 9 | `b55df01be12c2ea1f2e5a24818e4fa75a7f9a9d56308f87afe33f278801d5e3f` |
| angular-countries-edit-workflow-api | 8 | `ff276aa95fc18c307c2643d7f5b234fd8cc7b61a7a3028ff07d0e9d8ed3a9710` |
| angular-countries-edit-workflow-api | 9 | `b55df01be12c2ea1f2e5a24818e4fa75a7f9a9d56308f87afe33f278801d5e3f` |
| angular-countries-edit-workflow-api | 10 | `564a8021c73eace16eb080013f1642aeaa13633e4c3a21f7121220904a608d2a` |
| angular-countries-edit-workflow-web | 8 | `ff276aa95fc18c307c2643d7f5b234fd8cc7b61a7a3028ff07d0e9d8ed3a9710` |
| angular-countries-edit-workflow-web | 10 | `564a8021c73eace16eb080013f1642aeaa13633e4c3a21f7121220904a608d2a` |
| angular-countries-edit-workflow-web | 13 | `4f2482d3a8078435c3b1aa19e3a5c242fc8a6ca5bafd8027bbb30d7446eee075` |
| angular-countries-edit-workflow-mobile | 2 | `69e135396446c50c716b2a6a02dcf3c44a0c458a22831f62074b0f7bd160cc5b` |
| angular-countries-edit-workflow-mobile | 11 | `adda81dee42224b01bc2856c4f6282a4e94dd40fce4d5c5c636539fb544f459a` |
| angular-countries-edit-workflow-mobile | 12 | `023c1f0759d9e28fd51a1d3bc5d29849c23a156b2bfe19bebc5559ee18334fb9` |
| angular-countries-edit-workflow-mobile | 15 | `3bdb97fabcca5472fbecbb8945f60ca7500fd39e3eef75a68338e90f6bc895c5` |
