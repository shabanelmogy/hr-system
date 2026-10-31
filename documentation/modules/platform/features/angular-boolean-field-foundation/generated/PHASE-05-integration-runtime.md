<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Shared boolean field preparation Phase 05 - Integration and Runtime

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

- **Shared boolean field preparation cross-platform master review:** `../modules/platform/features/angular-boolean-field-foundation/angular-boolean-field-foundation-review.md` sections 4, 5, 6, 7, 9
- **Shared boolean field preparation API implementation profile:** `../modules/platform/features/angular-boolean-field-foundation/angular-boolean-field-foundation-api.md` sections 8, 9, 10
- **Shared boolean field preparation Next.js implementation profile:** `../modules/platform/features/angular-boolean-field-foundation/angular-boolean-field-foundation-web.md` sections 8, 10, 13
- **Shared boolean field preparation Expo implementation profile:** `../modules/platform/features/angular-boolean-field-foundation/angular-boolean-field-foundation-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-boolean-field-foundation-master | 4 | `ae0580508cdef5d62a38c6a271bbffb458db6607d6b003aced9625a17c049670` |
| angular-boolean-field-foundation-master | 5 | `3cd8929002b69dced37aadda0a53c2e47f73351a37ae9a936597ef2eb3798499` |
| angular-boolean-field-foundation-master | 6 | `d7f6f4307682c796c94479735e56a02e4f6fccbdf46208212ffcd6a662adee54` |
| angular-boolean-field-foundation-master | 7 | `8ecd38d30820550d928c2e3d9492bb9b2381fb8cba02032eff3bb01bbfde46e0` |
| angular-boolean-field-foundation-master | 9 | `aeb73463a736e3afc44a5c8a0e4b87ec424d4cf94c519c925a73c44192ca73ed` |
| angular-boolean-field-foundation-api | 8 | `653cc093d61e1ef12c7cebe2d2f0e0408d7c8eb7a561ba0993b8776d7a14b66b` |
| angular-boolean-field-foundation-api | 9 | `aeb73463a736e3afc44a5c8a0e4b87ec424d4cf94c519c925a73c44192ca73ed` |
| angular-boolean-field-foundation-api | 10 | `65025d0bddf1b98c587bd4cc2be53ffa24786df04ab9851b7f3666fa1c9d21d0` |
| angular-boolean-field-foundation-web | 8 | `653cc093d61e1ef12c7cebe2d2f0e0408d7c8eb7a561ba0993b8776d7a14b66b` |
| angular-boolean-field-foundation-web | 10 | `65025d0bddf1b98c587bd4cc2be53ffa24786df04ab9851b7f3666fa1c9d21d0` |
| angular-boolean-field-foundation-web | 13 | `d975f89d73aa5002720b88c1803beaff4fcd7debbea157646cdf01c938a97604` |
| angular-boolean-field-foundation-mobile | 2 | `7df39a32680faa803fac2f024cdd16a69c102b3185eb01cf3d3d437e907890ea` |
| angular-boolean-field-foundation-mobile | 11 | `a7500482bc0f7ba74d1dfaaaa201a2b834ef8d65330eec06b2b928a6b39933ff` |
| angular-boolean-field-foundation-mobile | 12 | `c8e140e7a3d9e643dd5a7af10a661fb28177db73db20ad06e98c1b2692ba3a5c` |
| angular-boolean-field-foundation-mobile | 15 | `6e78e61e77ecc4d9c79b57a7a26410c8041467221372b79d2b97c5269c55a798` |
