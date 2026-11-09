<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# States complete Angular parity Phase 05 - Integration and Runtime

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

- **States complete Angular parity cross-platform master review:** `../modules/platform/features/angular-states-workspace/angular-states-workspace-review.md` sections 4, 5, 6, 7, 9
- **States complete Angular parity API implementation profile:** `../modules/platform/features/angular-states-workspace/angular-states-workspace-api.md` sections 8, 9, 10
- **States complete Angular parity Next.js implementation profile:** `../modules/platform/features/angular-states-workspace/angular-states-workspace-web.md` sections 8, 10, 13
- **States complete Angular parity Expo implementation profile:** `../modules/platform/features/angular-states-workspace/angular-states-workspace-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-states-workspace-master | 4 | `337cd6781195f95a821c1ce670cfe9c86930d82007f1e1152f2b9855e12cefd1` |
| angular-states-workspace-master | 5 | `658b5a249ccf0aab79700f4874f371d4aff3484f7b02ffbdaf51459bddf7b503` |
| angular-states-workspace-master | 6 | `f1fa81a7964badb1ca8ccf5e92bac1822e68362601b9fc3708f45b3048f97f5b` |
| angular-states-workspace-master | 7 | `501a10a08c373e454ebac69f367245279aecf89c8a2b9c44928c8a67c720c492` |
| angular-states-workspace-master | 9 | `a300cf55dc219cefbfc033db706b12fccb640c2805d7cd8e010ccea1c298a2bb` |
| angular-states-workspace-api | 8 | `a2711720a0f2987543734da15a69eb1eb2596157145afa8a1fc4e852ea8d6ab5` |
| angular-states-workspace-api | 9 | `a300cf55dc219cefbfc033db706b12fccb640c2805d7cd8e010ccea1c298a2bb` |
| angular-states-workspace-api | 10 | `cfcb30676c9971033e8d24fc22f39d3237f9e9670bb15aaf3a663f2063d751ad` |
| angular-states-workspace-web | 8 | `a2711720a0f2987543734da15a69eb1eb2596157145afa8a1fc4e852ea8d6ab5` |
| angular-states-workspace-web | 10 | `cfcb30676c9971033e8d24fc22f39d3237f9e9670bb15aaf3a663f2063d751ad` |
| angular-states-workspace-web | 13 | `b71d7912db56b4c105ebcb0adc758cdcde8b72a4d9845d43e9fbc9f75f1ad260` |
| angular-states-workspace-mobile | 2 | `36d44963ed8890b4bd9a92d54e4dad1a83c150ac561160dc51e0d4a288791a31` |
| angular-states-workspace-mobile | 11 | `98b658eb4d1191f2dac57864eb9a8bc49d409da4227e35893994fddfc9f71d45` |
| angular-states-workspace-mobile | 12 | `b0ce98265d69ab51f50b51a1ebadab90756bb2d9c76733366e7e6ed8005a80e8` |
| angular-states-workspace-mobile | 15 | `857d073781337124f17a26cd4e96384186fe06ac15e2f6b485c160ebd606beb0` |
