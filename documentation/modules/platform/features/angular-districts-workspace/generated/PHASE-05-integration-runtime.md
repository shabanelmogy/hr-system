<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Districts complete Angular parity Phase 05 - Integration and Runtime

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

- **Districts complete Angular parity cross-platform master review:** `../modules/platform/features/angular-districts-workspace/angular-districts-workspace-review.md` sections 4, 5, 6, 7, 9
- **Districts complete Angular parity API implementation profile:** `../modules/platform/features/angular-districts-workspace/angular-districts-workspace-api.md` sections 8, 9, 10
- **Districts complete Angular parity Next.js implementation profile:** `../modules/platform/features/angular-districts-workspace/angular-districts-workspace-web.md` sections 8, 10, 13
- **Districts complete Angular parity Expo implementation profile:** `../modules/platform/features/angular-districts-workspace/angular-districts-workspace-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-districts-workspace-master | 4 | `f28c9ed08d649377a2113ffb8d720da7b09fcb9f16238158dd1fbb12e4ff174e` |
| angular-districts-workspace-master | 5 | `83ee8d058bd1852919a3b4e1e552e737c4d8dccf327cd57d07603025aefb2735` |
| angular-districts-workspace-master | 6 | `2d7594d538e94b03e4b496a02d2755f2a96745a20d527229c8d1c3c48ce829b8` |
| angular-districts-workspace-master | 7 | `054cae3882dac8d5d142ce6057c742535ca9f3c8d375ec5621ae1c5fb6efc855` |
| angular-districts-workspace-master | 9 | `db4b325ac4030e9da6b16e3f937c8e096cb382b7d0237821d04ba61450a5923f` |
| angular-districts-workspace-api | 8 | `6b0affc4f5a9229dcc500e114b0b37d60b52eb819ec6219986706b3957ba65fb` |
| angular-districts-workspace-api | 9 | `db4b325ac4030e9da6b16e3f937c8e096cb382b7d0237821d04ba61450a5923f` |
| angular-districts-workspace-api | 10 | `238aaba6b3f40c39dc608844d96971c0a35368f7cc1da44450383e2fadd8b0ba` |
| angular-districts-workspace-web | 8 | `6b0affc4f5a9229dcc500e114b0b37d60b52eb819ec6219986706b3957ba65fb` |
| angular-districts-workspace-web | 10 | `238aaba6b3f40c39dc608844d96971c0a35368f7cc1da44450383e2fadd8b0ba` |
| angular-districts-workspace-web | 13 | `3a83a7e85c9fb6480acffddc41e7d131bf60e191698e901ba53e2311999d0e68` |
| angular-districts-workspace-mobile | 2 | `7d3cdde508cc1fd64be7f337a3a3f1f9ad27e94ebbfe12465578ca7df367d84c` |
| angular-districts-workspace-mobile | 11 | `61b0f90a550f98e596889d1ca889cdd0884d8b101d9d1a467eac82f7e358f7f7` |
| angular-districts-workspace-mobile | 12 | `4e82a4b1fadb9cbe32c1a20f1c2f8928e6d5862e62e693d862aff3ac8d215234` |
| angular-districts-workspace-mobile | 15 | `418f1e8e5d2c6eb6de865f9043da23515ea3884d566bc8212780c4e764271ee6` |
