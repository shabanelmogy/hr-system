<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Company email templates Phase 05 - Integration and Runtime

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

- **Company email templates cross-platform master review:** `../modules/platform/features/company-email-templates/company-email-templates-review.md` sections 4, 5, 6, 7, 9
- **Company email templates API implementation profile:** `../modules/platform/features/company-email-templates/company-email-templates-api.md` sections 8, 9, 10
- **Company email templates Next.js implementation profile:** `../modules/platform/features/company-email-templates/company-email-templates-web.md` sections 8, 10, 13
- **Company email templates Expo implementation profile:** `../modules/platform/features/company-email-templates/company-email-templates-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-email-templates-master | 4 | `ecf324faf8fb27d4110c34672c429c9f8664b54d71c0fe07f24641366780567f` |
| company-email-templates-master | 5 | `2de0dd5d85a5dbfa19fbe1753d55bb85f5a952df818f401dde1a2d434286db00` |
| company-email-templates-master | 6 | `8ed77bb6949b5a4989589bba630b031ff6adc4d6a87ddc0b4758137c1021b5b0` |
| company-email-templates-master | 7 | `b806a110148b1bc25878a8c0537a288061646b9c75caf91bcf77dc745e7980a2` |
| company-email-templates-master | 9 | `dc8a0c48da6dff2cdbf7eb91e9650a8fc95b858a926dea30048c04c74abe1262` |
| company-email-templates-api | 8 | `0800b92f0acdcd92e1f39b6b07efc3da076eb900cd5e2d17e53e1a8a045ab88e` |
| company-email-templates-api | 9 | `89d30873984db963644035cfd6e1ffe483a42607205802b7f582960759fd4590` |
| company-email-templates-api | 10 | `f96971b24f29c3303b7c8270d55f52d6ac4124567f0a7fcc359daf39688e313f` |
| company-email-templates-web | 8 | `47c36b6225dea207dddadd8fea5157985285dbb3c4da730b4bbee2429d965859` |
| company-email-templates-web | 10 | `a5cbb4fc9ebb16ebca559c40ecca283fca9ce39f8b679942fec133a24545d88e` |
| company-email-templates-web | 13 | `fb2dcbf05534e4901b95a48b0930b1fc695d12a4d55dd91f17ecb26ccdaa03c4` |
| company-email-templates-mobile | 2 | `ef2f315e36c85167a3e1e86cd6fad960c1c9c56d84051348cded7e6cabdb2f63` |
| company-email-templates-mobile | 11 | `a335f402b24a86afd4f905e258dcfa0afe955977fd528db1e363c8b46163c6e3` |
| company-email-templates-mobile | 12 | `3d4aa8e1539f24fee10d75d7bcd8291e2fcae888dc08ebff541cb4ff0c1a4f0b` |
| company-email-templates-mobile | 15 | `aaed8f6c9d9426c6042bbdb3d1d629e0a79c1365a5a67147547fbed445f269bb` |
