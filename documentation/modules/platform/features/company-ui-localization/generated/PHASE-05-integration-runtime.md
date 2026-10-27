<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Company UI localization Phase 05 - Integration and Runtime

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

- **Company UI localization cross-platform master review:** `../modules/platform/features/company-ui-localization/company-ui-localization-review.md` sections 4, 5, 6, 7, 9
- **Company UI localization API implementation profile:** `../modules/platform/features/company-ui-localization/company-ui-localization-api.md` sections 8, 9, 10
- **Company UI localization Next.js implementation profile:** `../modules/platform/features/company-ui-localization/company-ui-localization-web.md` sections 8, 10, 13
- **Company UI localization Expo implementation profile:** `../modules/platform/features/company-ui-localization/company-ui-localization-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-ui-localization-master | 4 | `4bd147662b54d98c579aed8cff606deb90ad3a173bd56299833a23743eddfbb9` |
| company-ui-localization-master | 5 | `88ec13b2db18aca4ed531791eb3053318767fd3766c760f9158e250160093e24` |
| company-ui-localization-master | 6 | `943b732392e0c38800ae8e34732c3eba94fae4f111c24dd29ffa5bb65826cf61` |
| company-ui-localization-master | 7 | `84585fc9dd5664a9529a4b399768755ef9aae77060fa2123401f07440f5cbd7c` |
| company-ui-localization-master | 9 | `63b51c88d8a5d88a50e30ccc350a867f17af354c861fdd25adf44fbb52a11be2` |
| company-ui-localization-api | 8 | `a555533fd36049b26f9ec99541ffff190ce95edf577fe6e99f5864a3893ea3e1` |
| company-ui-localization-api | 9 | `ee95a26639431f522358b844f6b31749e1572743b616d7472661caee8fbe0738` |
| company-ui-localization-api | 10 | `427fd5b52e204c93ddb7fc429d5beb872b4e95424c36ea3b0918cbb767b349f1` |
| company-ui-localization-web | 8 | `78ba4e90fdd9faf3454d489beb2d3cc6a92791f1532eeaf426e432e25dc6fd83` |
| company-ui-localization-web | 10 | `171febad967d8bd7827cbabe7f5e7a6d1f6f2b57a553a618231c346caaf78765` |
| company-ui-localization-web | 13 | `aa6304c75e09579546d9af39a377e27ab6cc2e8e10604f1533a6a92ed64f97d4` |
| company-ui-localization-mobile | 2 | `cc59a46d73e4c858fe1f480031e1d0e63661c21a32353b9c0d8ca3a71c3bfdf1` |
| company-ui-localization-mobile | 11 | `a60d252f08206ad41a752583668c2cb3bbd03680c84ec4352a3e263e6296c6ea` |
| company-ui-localization-mobile | 12 | `5fd60e867cfca77071ee32c5414c78e9e1d5410f7d126aacc4e1ba481d702e8a` |
| company-ui-localization-mobile | 15 | `abdd7be309129ae44f826a2ef3210c9d6c4ef5ec58e8a4deae184a8d239fd0db` |
