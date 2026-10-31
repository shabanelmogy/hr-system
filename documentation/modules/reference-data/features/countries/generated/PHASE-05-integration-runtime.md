<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Phase 05 - Integration and Runtime

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

- **Countries cross-platform master review:** `../modules/reference-data/features/countries/countries-review.md` sections 4, 5, 6, 7, 9
- **Countries API implementation profile:** `../modules/reference-data/features/countries/countries-api.md` sections 8, 9, 10
- **Countries Next.js implementation profile:** `../modules/reference-data/features/countries/countries-web.md` sections 8, 10, 13
- **Countries Expo implementation profile:** `../modules/reference-data/features/countries/countries-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| master | 4 | `5313466cc23f4cd78d346588b46a10c8f3459953defddd6c00a05dc22f4ad6c5` |
| master | 5 | `c8c3b3bdf6614ff0b1275322bd5fdd5a96e55bb79a39c858e77805fe56d8ebf7` |
| master | 6 | `b7fb453c6be690cf10f98e85664f30fb55fb590e628b0f8a0435f54cf67058ac` |
| master | 7 | `e603de6e96ed32d995c8cf0eeb698f377a3da508a9febf3d500377754e915c84` |
| master | 9 | `44596f3895251595f33c0bd7c652e16d184747f1daa7bb26e83654d378f71266` |
| api | 8 | `dd207cd27ef0d9cd7d96de3e743aa1aa04eb0d5271e227ad002afc2613e28850` |
| api | 9 | `c1c6f745e49d895fa7a91d52fd3616c3c0010c46c00cd5c472f2c7e65f1791d3` |
| api | 10 | `e77aa77e83c9fa0dafedf407d882c7567d9247d1bc71ff454e48eaca59dde75e` |
| web | 8 | `43a7e4cb95554e828d56afdc3c933a1b1f224531dc5829a1c6d0b31e25f632fe` |
| web | 10 | `dfca66fe993ca501dfd506da6673879ea9c49d5f9fa8fcd1050486f4346ffaeb` |
| web | 13 | `2cd09debee74a370deae0a9a1811b55a3b1bd8dd6fe2013b2fbc025b71766149` |
| mobile | 2 | `21269af699d3bfad64b852c262d640017d620ac4165fa112561ef66626153552` |
| mobile | 11 | `6d043a9367e3d899f66abafd760eed0dfe3a6ad9e8114b839126cccc9a113f53` |
| mobile | 12 | `0f0448cb6bfbd6c14def633a07bb9148564323efd7e372d4f678a2a9f8d41153` |
| mobile | 15 | `32d1f6ee2341d41982d3fa5530b5e1a450b8632602efd545f3c85a198cc222d0` |
