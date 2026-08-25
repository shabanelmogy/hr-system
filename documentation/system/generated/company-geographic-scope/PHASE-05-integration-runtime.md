<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Company Geographic Scope Phase 05 - Integration and Runtime

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

- **Company Geographic Scope cross-platform master review:** `../project/COMPANY_GEOGRAPHIC_SCOPE_FEATURE_FULL_REVIEW.md` sections 4, 5, 6, 7, 9
- **Company Geographic Scope API implementation profile:** `../api/CompanyGeographicScope_API_Implementation_Profile.md` sections 8, 9, 10
- **Company Geographic Scope Next.js implementation profile:** `../web-next/features/company-geographic-scope-frontend-reference.md` sections 8, 10, 13
- **Company Geographic Scope Expo implementation profile:** `../mobile-react/company-geographic-scope-mobile-reference.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-geographic-scope-master | 4 | `8a793aa6af268801e0554b7339d3c2a20a793da042b2ada9e9688180a6e1331b` |
| company-geographic-scope-master | 5 | `bee5b9455987c00b7da87fbc48b1c9802a2dc48d9d5dc567157bd4cbe1c4767c` |
| company-geographic-scope-master | 6 | `92d260cdc23463e140aee8d219007e899e8cae69c926cc42eefd62f198ac4f06` |
| company-geographic-scope-master | 7 | `ac1df7984c1421dcc4decfb548cab2e1c25325bb3d8dfb0be5d5f83b305a926e` |
| company-geographic-scope-master | 9 | `61725b58626a9845ce6356fe9efaa047c1d7bbeccfaff098c23b18459e0a7a93` |
| company-geographic-scope-api | 8 | `bfa505287d661d283b0aa02f52e340f7d6fd52b22e9dfa42ad19350143811147` |
| company-geographic-scope-api | 9 | `879c8cc480f90b5e5d6d75947b590ee079c5c9c93bce9214473adc92cecac7e5` |
| company-geographic-scope-api | 10 | `1b1990713b597c7179919e9edd107e6afd94e4fdab56d43a6ecc106196aff6c3` |
| company-geographic-scope-web | 8 | `8b613d00bd6755da54d5ad7fd59560bf3ee5302139e4e91bf8dc6abf221a014d` |
| company-geographic-scope-web | 10 | `2019c38ff016a28e06ffedd30981f57aa46a1ba3858586fd3dc1f53a72577052` |
| company-geographic-scope-web | 13 | `6068676e499370206d086a0edf49591a1176ebfddefd65abc609cd39f59c5086` |
| company-geographic-scope-mobile | 2 | `222d3b572966f880d40e8ea982501f8b960119079307433882f971ce26f876da` |
| company-geographic-scope-mobile | 11 | `e662955d031606b0591f09c9827e45ea328b5c45f28faec7fe1ad21798cc83b9` |
| company-geographic-scope-mobile | 12 | `f7a65285cebf5482db8f642d637989138809b28c716cb015abee09b9779643ce` |
| company-geographic-scope-mobile | 15 | `b767fcba0ad7fe9bdf7849932dfda0e6a11627f7a25b97ba2b11c6b1efa23718` |
