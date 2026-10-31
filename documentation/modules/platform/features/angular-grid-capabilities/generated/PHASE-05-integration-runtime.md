<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Complete shared PrimeNG Table capabilities Phase 05 - Integration and Runtime

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

- **Complete shared PrimeNG Table capabilities cross-platform master review:** `../modules/platform/features/angular-grid-capabilities/angular-grid-capabilities-review.md` sections 4, 5, 6, 7, 9
- **Complete shared PrimeNG Table capabilities API implementation profile:** `../modules/platform/features/angular-grid-capabilities/angular-grid-capabilities-api.md` sections 8, 9, 10
- **Complete shared PrimeNG Table capabilities Next.js implementation profile:** `../modules/platform/features/angular-grid-capabilities/angular-grid-capabilities-web.md` sections 8, 10, 13
- **Complete shared PrimeNG Table capabilities Expo implementation profile:** `../modules/platform/features/angular-grid-capabilities/angular-grid-capabilities-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-grid-capabilities-master | 4 | `04a49d8f05ff7846a82b8487639c09b8b3d4a1fefd25bd89f94e13497629268f` |
| angular-grid-capabilities-master | 5 | `3472f547a2548a8a7dc7cf1a9793c19fe2af31f527680c4bf79cddde0fe01e8a` |
| angular-grid-capabilities-master | 6 | `dfcf9a6a661c765951ed8291e2d008a301fc7ffe081796f0ff0a8039eb11d9ef` |
| angular-grid-capabilities-master | 7 | `8cf28db5889c5e4cdbaf893c3bc712b096c49a27df338bc71a4a2744ccd5def6` |
| angular-grid-capabilities-master | 9 | `a1489c8330bd0c141667b8f5fa1740f2a3633e7102ab4687734ec2bf7725f178` |
| angular-grid-capabilities-api | 8 | `1a88531afb53989d42a83368fed092db8cdb99fbb3802aad2dcee8d02f9c023a` |
| angular-grid-capabilities-api | 9 | `a1489c8330bd0c141667b8f5fa1740f2a3633e7102ab4687734ec2bf7725f178` |
| angular-grid-capabilities-api | 10 | `c0b63473188ac0d8bdf814240acb1887e8ec1b3b0b2a7ab8775bc40215b23d09` |
| angular-grid-capabilities-web | 8 | `1a88531afb53989d42a83368fed092db8cdb99fbb3802aad2dcee8d02f9c023a` |
| angular-grid-capabilities-web | 10 | `c0b63473188ac0d8bdf814240acb1887e8ec1b3b0b2a7ab8775bc40215b23d09` |
| angular-grid-capabilities-web | 13 | `a946e454093eb7a23819b4e291046f565fd1cd09dbc8916a3a484e6b2f1bb4c0` |
| angular-grid-capabilities-mobile | 2 | `69ef1b7a3274521368a20c0d398fd2b62edf04537bac39cee66099cccbac9eb6` |
| angular-grid-capabilities-mobile | 11 | `c1ac27d24dc880a8c201595afe249db3a460bf6e78cfab9fb950431f422d680d` |
| angular-grid-capabilities-mobile | 12 | `9df3455d6570e40575058a4d70a528cf4753094da862e7a76ce400c14db5f135` |
| angular-grid-capabilities-mobile | 15 | `2b9cd282459fbfcf5f93b5806a4f7f33e285118413b510e94f95555d92c506ce` |
