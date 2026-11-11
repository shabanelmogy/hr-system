<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Super Admin System Audit Trail parity Phase 05 - Integration and Runtime

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

- **Super Admin System Audit Trail parity cross-platform master review:** `../modules/platform/features/angular-system-audit-workspace/angular-system-audit-workspace-review.md` sections 4, 5, 6, 7, 9, 16, 17
- **Super Admin System Audit Trail parity API implementation profile:** `../modules/platform/features/angular-system-audit-workspace/angular-system-audit-workspace-api.md` sections 8, 9, 10, 16, 17
- **System Audit Trail Angular client implementation profile:** `../modules/platform/features/angular-system-audit-workspace/angular-system-audit-workspace-web.md` sections 8, 10, 13, 16, 17
- **Super Admin System Audit Trail parity Expo implementation profile:** `../modules/platform/features/angular-system-audit-workspace/angular-system-audit-workspace-mobile.md` sections 2, 11, 12, 15, 16, 17

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-audit-workspace-master | 4 | `5c410a657baf4dc942706d66f6a50d6cac935de8897d25b3430d8ce58deaa78e` |
| angular-system-audit-workspace-master | 5 | `e8eefe6fd4499461e5ef5fee1027cece0a67a6eb23675be5e2a7da7dea4bd9b1` |
| angular-system-audit-workspace-master | 6 | `0757cb85fb64ab8d3129445c494bb5332c468f7e14f2bb99dd45a9e1ebfdd85b` |
| angular-system-audit-workspace-master | 7 | `da87f59916f591acee86e14bb3dd36aeda9bfc9ea39d1d8118b370e657f93cf4` |
| angular-system-audit-workspace-master | 9 | `bfe3c56110cb9e2dd3ff1d6ae28f28e836cc6795916976cc5ea125d1960c2a97` |
| angular-system-audit-workspace-master | 16 | `7528ad6b5b17f2d048872b772d8fbb1c0b19eadd1b04f92b4541bf7b382cd705` |
| angular-system-audit-workspace-master | 17 | `80c769644b662109d525c1e177fd65fbf0aca243f678aea7bdd177c82c1576aa` |
| angular-system-audit-workspace-api | 8 | `fe1dcbe0ed968bf0bd8847d263bcd2a32b5c1392f51e4ec8d7d72480c94d2008` |
| angular-system-audit-workspace-api | 9 | `bfe3c56110cb9e2dd3ff1d6ae28f28e836cc6795916976cc5ea125d1960c2a97` |
| angular-system-audit-workspace-api | 10 | `7bae6bcb1db81bd9577afd59216566fa86f1eca6cc68d0bf365b9bb35af8dc96` |
| angular-system-audit-workspace-api | 16 | `7528ad6b5b17f2d048872b772d8fbb1c0b19eadd1b04f92b4541bf7b382cd705` |
| angular-system-audit-workspace-api | 17 | `80c769644b662109d525c1e177fd65fbf0aca243f678aea7bdd177c82c1576aa` |
| angular-system-audit-workspace-web | 8 | `fe1dcbe0ed968bf0bd8847d263bcd2a32b5c1392f51e4ec8d7d72480c94d2008` |
| angular-system-audit-workspace-web | 10 | `7bae6bcb1db81bd9577afd59216566fa86f1eca6cc68d0bf365b9bb35af8dc96` |
| angular-system-audit-workspace-web | 13 | `36eb648972d9f80ac55b56fb7c37523213187bc81fd0c37e0a368f099ec90429` |
| angular-system-audit-workspace-web | 16 | `7528ad6b5b17f2d048872b772d8fbb1c0b19eadd1b04f92b4541bf7b382cd705` |
| angular-system-audit-workspace-web | 17 | `80c769644b662109d525c1e177fd65fbf0aca243f678aea7bdd177c82c1576aa` |
| angular-system-audit-workspace-mobile | 2 | `ec1abfdbe1d6f23f81c35becb8e10e65908b6e7253be193981561639cc70f3c5` |
| angular-system-audit-workspace-mobile | 11 | `b0f7e4802c90ae55f72ff44d21fd2e51f754f1aa25181bcdf33aa0252573c1d8` |
| angular-system-audit-workspace-mobile | 12 | `303464ebeb3776b24df0370d3ca5ab3aaef9b23b2f3beb18911c3ef43238623f` |
| angular-system-audit-workspace-mobile | 15 | `16e732c048cf89e38f223fa037c1266d209cfa019d962f8a9a1657b60941be01` |
| angular-system-audit-workspace-mobile | 16 | `7528ad6b5b17f2d048872b772d8fbb1c0b19eadd1b04f92b4541bf7b382cd705` |
| angular-system-audit-workspace-mobile | 17 | `80c769644b662109d525c1e177fd65fbf0aca243f678aea7bdd177c82c1576aa` |
