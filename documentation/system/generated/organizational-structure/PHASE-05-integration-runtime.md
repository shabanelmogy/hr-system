<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Organizational Structure Phase 05 - Integration and Runtime

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

- **Organizational Structure cross-platform master review:** `../project/ORGANIZATIONAL_STRUCTURE_FEATURE_FULL_REVIEW.md` sections 4, 5, 6, 7, 9
- **Organizational Structure API implementation profile:** `../api/OrganizationalStructure_API_Implementation_Profile.md` sections 8, 9, 10
- **Organizational Structure Next.js implementation profile:** `../web-next/features/organizational-structure-frontend-reference.md` sections 8, 10, 13
- **Organizational Structure Expo implementation profile:** `../mobile-react/organizational-structure-mobile-reference.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| organizational-structure-master | 4 | `0beaf7376a09bb7c622523a47042700f05bf8105485ff4f3fda6be4ed287136a` |
| organizational-structure-master | 5 | `f6ce22854058c1886ebddf1698075291a68bb0e4c971a587028f433124d7055e` |
| organizational-structure-master | 6 | `2fdee62992580c5d76fc63348edf52701b1e514b1c18ff8be30c53dda4d1b0bf` |
| organizational-structure-master | 7 | `148433024e55eb81022d5badf23df9f09715eddddbbfbcc6abb8aa0b6c7bf7d8` |
| organizational-structure-master | 9 | `4dd3e4d89adedada36533fdfafd9701667e1b1572117aeaa536cb1c1558f2885` |
| organizational-structure-api | 8 | `8427fbc60b6506434f168bbb92cebc0b07e6699dec5f0c7e336d6b0c7906c32a` |
| organizational-structure-api | 9 | `bb97abd860546e88987447fc83aeaa058d22e9fc11562226223c3952b5391913` |
| organizational-structure-api | 10 | `691c8be03efd3ce06ac8b599b24b3736ef9b3f74d8da99e0a19cbe28d593839f` |
| organizational-structure-web | 8 | `81709390ab5691f03acc9dcd2b845f95f2a60c0ee2707ea8d96dcfc4efd4d812` |
| organizational-structure-web | 10 | `c25e75c25fae7744eb25e95dbc1644c94d4955fae4e6f87f95947b8decd7fb33` |
| organizational-structure-web | 13 | `f426db9a30f8de5984d35e6fcfbd4c2e466f6f573c87b20ee831432a35f69058` |
| organizational-structure-mobile | 2 | `47cebdf0a98ae323696ee1964ea27494638b937c1860d250e2baef9f4cb8d8f0` |
| organizational-structure-mobile | 11 | `ec3e51c2ef99a1494eb03474652b596423e1d5fcc07a4ad7cf8066b0517e1b4e` |
| organizational-structure-mobile | 12 | `a8731c681436d699f98b56159978ab43b87dec90325e32bd0d384599339f2d4b` |
| organizational-structure-mobile | 15 | `85d324cd065dd2048f40a320715e506ab78f314b3db5d3481f67954747d86195` |
