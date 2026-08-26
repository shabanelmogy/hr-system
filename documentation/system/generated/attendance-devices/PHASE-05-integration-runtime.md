<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Attendance Devices Phase 05 - Integration and Runtime

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

- **Attendance Devices cross-platform master review:** `../project/ATTENDANCE_DEVICES_FEATURE_FULL_REVIEW.md` sections 4, 5, 6, 7, 9
- **Attendance Devices API implementation profile:** `../api/AttendanceDevices_API_Implementation_Profile.md` sections 8, 9, 10
- **Attendance Devices Next.js implementation profile:** `../web-next/features/attendance-devices-frontend-reference.md` sections 8, 10, 13
- **Attendance Devices Expo implementation profile (deferred):** `../mobile-react/attendance-devices-mobile-reference.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| attendance-devices-master | 4 | `883d12a168ad1f5a7d103912e0541748d3d3a692be6eea2417865a39f5e2ea18` |
| attendance-devices-master | 5 | `a8599be59e64807dfe1321db01ce8a1da59a23a09dd79e2d9bb38284ae21fe02` |
| attendance-devices-master | 6 | `d4d02053ca38139b5ea51928c18352d2ad86e08b3b1308b3d3fa58fab55db761` |
| attendance-devices-master | 7 | `433b3f83669c1abbc1d39bf7fc3c8bcf8b759e1311566bfeb4e0f5c248b302ec` |
| attendance-devices-master | 9 | `b595373da84cb1d4786a69231c4df208ce383549198d947e238e5ca1876f2ce2` |
| attendance-devices-api | 8 | `f78bbaac90ebc303e057c975714f5a06e0bf81574edf89265c4893e1609e09ab` |
| attendance-devices-api | 9 | `0a86e958c61b0f6569cecb994467e0942249cdfdfc670af54a5ba7fff895ec19` |
| attendance-devices-api | 10 | `9c74502942c3903fa9369c7e948976624dec6f63b07ab06e2272b1c152cea6ef` |
| attendance-devices-web | 8 | `e0bf7f1dade9eb1795bf7dbd1cdd0db0104d3d7cfefdcb9400756a8f3cb89f1c` |
| attendance-devices-web | 10 | `23f0dcc86d515444f8e139d037bc9a662737703b739aca8b7394a47c8138ffb9` |
| attendance-devices-web | 13 | `fc31618e8d985cd765e02700bcf99f1c7f58b119b3fa1ac2916ae9a4f7e38953` |
| attendance-devices-mobile | 2 | `14455a3b23dee24861cb73b6c36f0f2be23653a00d9c81f2c5827c0bcb6835d1` |
| attendance-devices-mobile | 11 | `f6e3af50cabec47f4411d301618509d22c795267a86a53bd1dfdf111edba5da4` |
| attendance-devices-mobile | 12 | `aa84e3d7d989e7208f9f8156901ce3a77743aa2dbb9fcc15aaa0a8854f904b2b` |
| attendance-devices-mobile | 15 | `eefc51f54f37fd552cb52fbb4be11b6e3757b79ecc18ee399ac8d2d409756a6f` |
