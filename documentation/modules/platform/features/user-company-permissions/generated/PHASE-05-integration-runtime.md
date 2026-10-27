<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Company user permission grants Phase 05 - Integration and Runtime

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

- **Company user permission grants cross-platform master review:** `../modules/platform/features/user-company-permissions/user-company-permissions-review.md` sections 4, 5, 6, 7, 9
- **Company user permission grants API implementation profile:** `../modules/platform/features/user-company-permissions/user-company-permissions-api.md` sections 8, 9, 10
- **Company user permission grants Next.js implementation profile:** `../modules/platform/features/user-company-permissions/user-company-permissions-web.md` sections 8, 10, 13
- **Company user permission grants Expo implementation profile:** `../modules/platform/features/user-company-permissions/user-company-permissions-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| user-company-permissions-master | 4 | `430044ad5b767ae3900caf16f98f07eb86dd7c7554c61c731ac605f65de84680` |
| user-company-permissions-master | 5 | `0a5de5672c9bf63cefc21499e645994b499b01a9999c0563a733feb7a361c039` |
| user-company-permissions-master | 6 | `38e2c11893e8006dff70b461aaaaafcf8eb2e0aebb41a699ebd687473a153fc3` |
| user-company-permissions-master | 7 | `fc892ef575fb17921faf7c27fb0aa6f4e37f3f9991548802009cc663a1519d5e` |
| user-company-permissions-master | 9 | `f84749af9d320ccfd69017091157101cc8697821c62a683ab73a02dfc2e338f6` |
| user-company-permissions-api | 8 | `82e367723ae40c48a6ebd7996337d790ed10c9e178aee51f49ce1038c4a8c896` |
| user-company-permissions-api | 9 | `f84749af9d320ccfd69017091157101cc8697821c62a683ab73a02dfc2e338f6` |
| user-company-permissions-api | 10 | `04d729d73d70bbf01c5ab66c715c4e5c10064ab6fab26737d39ed6e021f55c24` |
| user-company-permissions-web | 8 | `82e367723ae40c48a6ebd7996337d790ed10c9e178aee51f49ce1038c4a8c896` |
| user-company-permissions-web | 10 | `04d729d73d70bbf01c5ab66c715c4e5c10064ab6fab26737d39ed6e021f55c24` |
| user-company-permissions-web | 13 | `4e889133e082456b5a4c3cd18b0ac78fdd1b875682672183455e445d23826e81` |
| user-company-permissions-mobile | 2 | `2943318c6241f7b16eaf317945cc98bd99284388a7b7ab09d15aac3051f7165c` |
| user-company-permissions-mobile | 11 | `47b385d6144ecc3f4dccc5eb270d800053f32d9d5f7710619626de847c0e3df4` |
| user-company-permissions-mobile | 12 | `3bc15e98a11e24ffdf9d7c1f10ac4cd3f9b57db3f9dadf47c5d9a99d10e6c039` |
| user-company-permissions-mobile | 15 | `498e787689db01b6c63af622723517cfc79817446fa05d395dcc959ab50b7d0d` |
