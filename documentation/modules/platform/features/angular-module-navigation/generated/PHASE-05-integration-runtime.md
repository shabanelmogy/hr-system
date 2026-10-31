<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Angular Module Navigation Phase 05 - Integration and Runtime

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

- **Angular Module Navigation cross-platform master review:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-review.md` sections 4, 5, 6, 7, 9
- **Angular Module Navigation API implementation profile:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-api.md` sections 8, 9, 10
- **Angular Module Navigation Angular web implementation profile:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-web.md` sections 8, 10, 13
- **Angular Module Navigation Expo implementation profile:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-module-navigation-master | 4 | `b28a3b2785647f5b9b22349ffe73a0dc47e51a6109e6c55c040af287c7059528` |
| angular-module-navigation-master | 5 | `f7b8352d8da1f0dac5d2ab4775b2fd706ef6fe6962a70ea9710449ba67d0af7d` |
| angular-module-navigation-master | 6 | `c7773a3a3d0320d23e28d420cb03a504db926c0a495f24ef84a2926c8d88a00a` |
| angular-module-navigation-master | 7 | `c0368a40fcdb1d0dc4a2648e49ff4afedf43fd35705dcd3e186709a51d923980` |
| angular-module-navigation-master | 9 | `9950bddc28087fecd3db8304d05b405fea1c86b9944f70ed2deaf4ae597fb96d` |
| angular-module-navigation-api | 8 | `a28c8e7ab96b8e263b65d6cc6f29ddcd7aa21eb204515da26481e4240515a6d9` |
| angular-module-navigation-api | 9 | `9950bddc28087fecd3db8304d05b405fea1c86b9944f70ed2deaf4ae597fb96d` |
| angular-module-navigation-api | 10 | `efe41e6f92e1f3ac374e8884cdcc69bb7a57e9e92f2a575c56b009ba123ca16f` |
| angular-module-navigation-web | 8 | `a28c8e7ab96b8e263b65d6cc6f29ddcd7aa21eb204515da26481e4240515a6d9` |
| angular-module-navigation-web | 10 | `efe41e6f92e1f3ac374e8884cdcc69bb7a57e9e92f2a575c56b009ba123ca16f` |
| angular-module-navigation-web | 13 | `9ece4d0a3c48dc7b34f4a00ff0a152ddbb883467ee696490e4852b490d3cdffa` |
| angular-module-navigation-mobile | 2 | `666b864631d96453655347da71a1b8b875e31e8fca1fc4333ff4bc694d7ac355` |
| angular-module-navigation-mobile | 11 | `b4c289942920da35fc175c9081cb5d577f732a62a5ed72c8877847cdbaef54f8` |
| angular-module-navigation-mobile | 12 | `322cb4f8bacc05c7ffa8fdcd53bdbe483e44414b260b25f91f248729033fe297` |
| angular-module-navigation-mobile | 15 | `452488eaf324f65f31839480b064e4bd2f7e3c44ca780f6e7856e7a7ab924c0e` |
