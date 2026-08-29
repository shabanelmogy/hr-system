<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Addresses Phase 05 - Integration and Runtime

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

- **Addresses domain foundation review:** `../project/ADDRESSES_DOMAIN_FULL_REVIEW.md` sections 4, 5, 6, 8
- **Addresses API implementation profile:** `../api/Addresses_API_Implementation_Profile.md` sections 4, 5, 6
- **Addresses Next.js integration profile:** `../web-next/features/addresses-frontend-reference.md` sections 3, 4
- **Addresses Expo integration profile:** `../mobile-react/addresses-mobile-reference.md` sections 2, 3

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| addresses-master | 4 | `a0fef0349c927251944fe7c45c4b516e66cdf31e740e3e873e5fb429a24fe935` |
| addresses-master | 5 | `be429c9bb75de8fc649c7097750eb74710ba53166dd392c1cfc1260915c8fd41` |
| addresses-master | 6 | `092efe579125795dd3e96f224fb296b90ea0ad86eab17f9eaef9924f667150b1` |
| addresses-master | 8 | `9a5cdf5e7a3062179ef4b2eb8d98cfda5148304af1881b825b55407907d315f6` |
| addresses-api | 4 | `81059eee3946f048337a39bc4f5670ca9d06b799ef705376eab0796f0fee8e5c` |
| addresses-api | 5 | `fe6d8f95bb036b50e528a130b9b7aaeed873388807c4385ee5b684161f40b237` |
| addresses-api | 6 | `8ac01141e5d6cdf190b5adfc679c6ce961d165e9065e392853241b13498aa3c9` |
| addresses-web | 3 | `cf52ae55bf5bf1445dcdc27ce509e712c54be157c5183f60060ae25d9c4db85d` |
| addresses-web | 4 | `6ab933027d6080feaeff87e1514d968c3d4fbc9f7951e69a769d52a6916abbf9` |
| addresses-mobile | 2 | `e675bb04e376c78d751a0170eed43d229dd88537467847369f7a53204bbffb00` |
| addresses-mobile | 3 | `e73acd99682385112902539081bc0398cb7dcc8b834de6a2b3f05f7e4bb67b99` |
