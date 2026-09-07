<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Workforce Planning Phase 05 - Integration and Runtime

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

- **Workforce Planning cross-platform master review:** `../project/WORKFORCE_PLANNING_FEATURE_FULL_REVIEW.md` sections 4, 5, 6, 7, 9
- **Workforce Planning API implementation profile:** `../api/WorkforcePlanning_API_Implementation_Profile.md` sections 8, 9, 10
- **Workforce Planning Next.js implementation profile:** `../web-next/features/workforce-planning-frontend-reference.md` sections 8, 10, 13
- **Workforce Planning Expo implementation profile:** `../mobile-react/workforce-planning-mobile-reference.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| workforce-planning-master | 4 | `159708f556ff4c7fd6abe33b8953d5e9f2024ef3b688fb8fa310e5253c622625` |
| workforce-planning-master | 5 | `22db93cf07be5c6356d8aec9b270f1e8e15b9f2a0fe0b20495f70c896d21107e` |
| workforce-planning-master | 6 | `aca3820d1e8cceabd1d783a1fec9e1265ae8fe95ea335ed7d5469e4e39f43829` |
| workforce-planning-master | 7 | `be08f8b94bfb467005917ed0b5875f676b1069c96678fea62b082c1ad6041852` |
| workforce-planning-master | 9 | `618443cb9a7c4d12f71415983eb3c79478d3ea3010d923cb74e3c396eca9b440` |
| workforce-planning-api | 8 | `c704b6af82f8445876dfd1f1ab587e91b5c22c45d4c7de226d0f0796368fb47a` |
| workforce-planning-api | 9 | `68468926495a461460f5035398f8c1157318ac4dda103d249f2b2a9c58926792` |
| workforce-planning-api | 10 | `2e1212fe37e33e9c36a2ef3e2065386885f2b4de94610164d896694b735a5774` |
| workforce-planning-web | 8 | `8b343f4f8bf42f04bd0f364c17055290e0a6b359f502fe494d1a34e7286f6b35` |
| workforce-planning-web | 10 | `2d6934251985264cabbdcd0ebc1fa856a1ed701f2c9a1241e2aa02724a36c65a` |
| workforce-planning-web | 13 | `5a0c7e85627cc62f56aa58ffa053de7a4135c6ceebb80224747edadb159092be` |
| workforce-planning-mobile | 2 | `5496effdc53dd627494401e4ab27129427cb36867b292bc40e3d91a3b4e392f0` |
| workforce-planning-mobile | 11 | `8dd034f4bc5ac13c8db4677149426911c07a7cb253950525a16057ff221f4062` |
| workforce-planning-mobile | 12 | `0f86b606461f3c155af19fcea49a744f5829e9aa0aaec1a14223178af2ad43a9` |
| workforce-planning-mobile | 15 | `e886a90cc9a59d080e123c96c072ea5ed243174544cdc9aa468996bc2ffc8d35` |
