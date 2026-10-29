<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Angular Application Shell Phase 05 - Integration and Runtime

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

- **Angular Application Shell cross-platform master review:** `../modules/platform/features/angular-application-shell/angular-application-shell-review.md` sections 4, 5, 6, 7, 9
- **Angular Application Shell API implementation profile:** `../modules/platform/features/angular-application-shell/angular-application-shell-api.md` sections 8, 9, 10
- **Angular Application Shell Angular web implementation profile:** `../modules/platform/features/angular-application-shell/angular-application-shell-web.md` sections 8, 10, 13
- **Angular Application Shell Expo implementation profile:** `../modules/platform/features/angular-application-shell/angular-application-shell-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-application-shell-master | 4 | `caf058a22c30460e1e9b20a688f77f8ced402b30e75d5e7619a99c59618b66b4` |
| angular-application-shell-master | 5 | `37689c61ee256203558078245aefc583e90e595faf6b21072222d367bc563cdd` |
| angular-application-shell-master | 6 | `faabbbe88bf326eea9511bbf97bec39a1b42c35ce2230c655e71672291c3231c` |
| angular-application-shell-master | 7 | `38103c6fc5fc366e8d4808935148f4982bc2ff7a1077bc6b47866a5a59341914` |
| angular-application-shell-master | 9 | `171a213120b293cd32c3bb0e2ec90a86d4baff38de60c8ec38a72053fa61aced` |
| angular-application-shell-api | 8 | `ca4ee16c814aceee76194125377f3bd6b8f2007d2ba647b8d7ddbdae5617834e` |
| angular-application-shell-api | 9 | `171a213120b293cd32c3bb0e2ec90a86d4baff38de60c8ec38a72053fa61aced` |
| angular-application-shell-api | 10 | `99e22673f4a63eb2aa922a85364d71c0c32f7b06bf02467ab629acd0288e8de1` |
| angular-application-shell-web | 8 | `ca4ee16c814aceee76194125377f3bd6b8f2007d2ba647b8d7ddbdae5617834e` |
| angular-application-shell-web | 10 | `99e22673f4a63eb2aa922a85364d71c0c32f7b06bf02467ab629acd0288e8de1` |
| angular-application-shell-web | 13 | `0f31d57c1a04f5819829d63ecd548287884d582fa148b1f26eaee0f86a906590` |
| angular-application-shell-mobile | 2 | `832cb5332e6be88662481f48f16fdc3a2fa6b0c2b135e9ed874308ded3bf9051` |
| angular-application-shell-mobile | 11 | `4afad814fac09a3ae3647a6a443a6ee3d0a50162a0a2ca29ddaff98d0e28120f` |
| angular-application-shell-mobile | 12 | `148e66f157845465d73081eb09cd5b24e8a38d6978de8c68df5626ffe4449a18` |
| angular-application-shell-mobile | 15 | `9decaf031292c3b4e868f05781846b96c45f7443d62d9fa6fd25d4e7cc89e431` |
