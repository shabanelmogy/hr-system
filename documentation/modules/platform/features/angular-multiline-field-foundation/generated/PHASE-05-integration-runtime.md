<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Shared multiline text preparation Phase 05 - Integration and Runtime

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

- **Shared multiline text preparation cross-platform master review:** `../modules/platform/features/angular-multiline-field-foundation/angular-multiline-field-foundation-review.md` sections 4, 5, 6, 7, 9
- **Shared multiline text preparation API implementation profile:** `../modules/platform/features/angular-multiline-field-foundation/angular-multiline-field-foundation-api.md` sections 8, 9, 10
- **Shared multiline text preparation Next.js implementation profile:** `../modules/platform/features/angular-multiline-field-foundation/angular-multiline-field-foundation-web.md` sections 8, 10, 13
- **Shared multiline text preparation Expo implementation profile:** `../modules/platform/features/angular-multiline-field-foundation/angular-multiline-field-foundation-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-multiline-field-foundation-master | 4 | `272c8a449698331c70fc6883b437ad47aa524650b723fd00314171c84a2ac137` |
| angular-multiline-field-foundation-master | 5 | `55d7a670d6c8ab06524dc4d9145f2d376f88128ea78329ba8259df6add6962ca` |
| angular-multiline-field-foundation-master | 6 | `51cf520b90ebc1b36766ed9237956fd993efb9ae57664f8acdd0256647497fc9` |
| angular-multiline-field-foundation-master | 7 | `db612ba36f16416719d93ed49b8660afab5a1259824713bfa338a822b96a6ae3` |
| angular-multiline-field-foundation-master | 9 | `30a38aa4bc0500dd5b8495ee79bdada7874c3c8253df3f0b847d1f8862420a5f` |
| angular-multiline-field-foundation-api | 8 | `a148c7cf56651c9ef62b377bd197760bbb7386b6f0fd40c1c5324e7e9fe6f4c2` |
| angular-multiline-field-foundation-api | 9 | `30a38aa4bc0500dd5b8495ee79bdada7874c3c8253df3f0b847d1f8862420a5f` |
| angular-multiline-field-foundation-api | 10 | `b66b763d995638f3eda95a48835de6684c52f9e16efbcf70322c0d8c6197556b` |
| angular-multiline-field-foundation-web | 8 | `a148c7cf56651c9ef62b377bd197760bbb7386b6f0fd40c1c5324e7e9fe6f4c2` |
| angular-multiline-field-foundation-web | 10 | `b66b763d995638f3eda95a48835de6684c52f9e16efbcf70322c0d8c6197556b` |
| angular-multiline-field-foundation-web | 13 | `83eb1b4d450eb4f632c16b978a8e024efb58c522331894786037b5d3d37ac26b` |
| angular-multiline-field-foundation-mobile | 2 | `2d110f0724d2e90bec139e2abead3e0e19dc19d2f9901387038a9a79a683afea` |
| angular-multiline-field-foundation-mobile | 11 | `6dd85e6c3efefb21e7a22deae56561fc17b1867f21faa8ac3d7ec3bb59eb8a73` |
| angular-multiline-field-foundation-mobile | 12 | `19cc3e3ce022cf4146582f55c84897e61dd06af122c086fc853ff16fd265ebf1` |
| angular-multiline-field-foundation-mobile | 15 | `57a711ce0f151c35d096c9ec0ede86a98ae004c61c36dde0f9dfe278fc473fc7` |
