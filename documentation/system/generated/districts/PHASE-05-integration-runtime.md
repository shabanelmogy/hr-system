<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Districts Phase 05 - Integration and Runtime

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

- **Districts cross-platform master review:** `../project/DISTRICTS_FEATURE_FULL_REVIEW.md` sections 4, 5, 6, 7, 9
- **Districts API implementation profile:** `../api/Districts_API_Implementation_Profile.md` sections 8, 9, 10
- **Districts Next.js implementation profile:** `../web-next/features/districts-frontend-reference.md` sections 8, 10, 13
- **Districts Expo implementation profile:** `../mobile-react/districts-mobile-reference.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| districts-master | 4 | `73edb563ff159ccd70caafab0275db68887f98c3c3f22ecdfaaea7ee41b4fb2e` |
| districts-master | 5 | `a659fd10d2093ed9856dfc0d0bed75062cff6a8cc94936ec227149c8572de15d` |
| districts-master | 6 | `bc842f66c8ecdd4133ee9a86a1901d41047bc8cc48ec01e8a302ca6ab510da07` |
| districts-master | 7 | `3d84c5bf7c2aa48ef6dc0fe9c7e5c5e255c11021660bd368b5867c05f11bef86` |
| districts-master | 9 | `6266a855e1cd714553644fb584e857d8f02350ce0abec9a1904245cf0f63eeb5` |
| districts-api | 8 | `808bf1aa73ef33b6517d65ccc0aa7d5595474cb438f80fb39f8338791b3d797e` |
| districts-api | 9 | `aeac4e735beefd1c983a5f7d3f91dbb1940654f07a65e431741ba6610e13bf65` |
| districts-api | 10 | `36d563363a7c0b878ef54b12ab23dc6eb7e77e583b14c5199eeed69540539ee0` |
| districts-web | 8 | `be712da7a3d1189fdfda72359bb163b3f0693dd01c2f22edcf49b6b24526e239` |
| districts-web | 10 | `07dc5e4839e2ea5afe7e0dac597585ad1749007fd1a22a343d4b59298372e00a` |
| districts-web | 13 | `0fbf57fe068b3bf7f395d05dbae5002f3c975ac356b56f9c02552831491f3349` |
| districts-mobile | 2 | `18881b6d1d70c7f055fc22edb5d5f998d3c3b2bbdb15dbc4393d5b5266205b41` |
| districts-mobile | 11 | `2168087827d6275ad0b45dc263ca1d342db0be761e705bdd276c7283ee141b88` |
| districts-mobile | 12 | `039c5d354f80749eb57e527c45efaddbbbdd34394cfe57da84a3a4e05eb5366f` |
| districts-mobile | 15 | `659b10d4561775eeb6d72d7acce06a4515644958840ec7820f9097e7a1826050` |
