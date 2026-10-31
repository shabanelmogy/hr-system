<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Angular Company Context Phase 05 - Integration and Runtime

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

- **Angular Company Context cross-platform master review:** `../modules/platform/features/angular-company-context/angular-company-context-review.md` sections 4, 5, 6, 7, 9
- **Angular Company Context API implementation profile:** `../modules/platform/features/angular-company-context/angular-company-context-api.md` sections 8, 9, 10
- **Angular Company Context Angular web implementation profile:** `../modules/platform/features/angular-company-context/angular-company-context-web.md` sections 8, 10, 13
- **Angular Company Context Expo implementation profile:** `../modules/platform/features/angular-company-context/angular-company-context-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-company-context-master | 4 | `33ac2b68366190503fea644fa25ab07f6f4db8bac30ec031b362cd61c25770a3` |
| angular-company-context-master | 5 | `96f6a5e9a4801d5701a98c5751a4d6ff78f89023a355368a6af7ad50c4601a18` |
| angular-company-context-master | 6 | `d358079c04f995e0f06a80047c596457bf688c2606c38afa5af000425e8d7324` |
| angular-company-context-master | 7 | `a6989eff1f1c1a31c97de9a9493237f71b0976d722153e3061380c57c221d6f6` |
| angular-company-context-master | 9 | `d132938c99a9616bfa53df535c2a6fd45aff5a6ad81fa0d6f3f921758a806f08` |
| angular-company-context-api | 8 | `834ac0a66a13b464cf0ec1dcde0d92abbe02ed2eeb9ac63a7b438ba6203fd389` |
| angular-company-context-api | 9 | `d132938c99a9616bfa53df535c2a6fd45aff5a6ad81fa0d6f3f921758a806f08` |
| angular-company-context-api | 10 | `2dc6d4c18f56599e8f391bb6e5b7e07352be81e8ebeb0028b9e0917e3cb86c4e` |
| angular-company-context-web | 8 | `834ac0a66a13b464cf0ec1dcde0d92abbe02ed2eeb9ac63a7b438ba6203fd389` |
| angular-company-context-web | 10 | `2dc6d4c18f56599e8f391bb6e5b7e07352be81e8ebeb0028b9e0917e3cb86c4e` |
| angular-company-context-web | 13 | `b3b5c35ad2ec7169cce70d7c8b4cb6c3a5f176100ac79557040078938853f35a` |
| angular-company-context-mobile | 2 | `f5cb088c899901db4325210a2618ebbd13cf9309cd6f9c102d5449f54d6d6e38` |
| angular-company-context-mobile | 11 | `1143b113c8297b174b9d634a216df28433520c46a609679ab3f798c7c9c6a9ad` |
| angular-company-context-mobile | 12 | `c22e835b038d8a04dcc0fb1af7298a14be4d399cf9bcac423b889f80fd2f0937` |
| angular-company-context-mobile | 15 | `ddefe8da934c11cc2f7075936e63a14ee1f13b937a68344cabdf32bde2099780` |
