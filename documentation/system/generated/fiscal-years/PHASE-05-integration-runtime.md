<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Fiscal Years Phase 05 - Integration and Runtime

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

- **Fiscal Years cross-platform master review:** `../project/FISCAL_YEARS_FEATURE_FULL_REVIEW.md` sections 4, 5, 6, 7, 9
- **Fiscal Years API implementation profile:** `../api/FiscalYears_API_Implementation_Profile.md` sections 8, 9, 10
- **Fiscal Years Next.js implementation profile:** `../web-next/features/fiscal-years-frontend-reference.md` sections 8, 10, 13
- **Fiscal Years Expo implementation profile:** `../mobile-react/fiscal-years-mobile-reference.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| fiscal-years-master | 4 | `ae8155eb0f3e367113ca06829c8dc5a977d40f300ab07eac4bc4c0d34b923075` |
| fiscal-years-master | 5 | `4f80eec784259d6653edaa0687fc11cfc5916c3d371f7f9131556c1df76fabe0` |
| fiscal-years-master | 6 | `225416faf8af3c0eb0b46137e7224277e9ffe1f40b17bd0395016d24ec503d41` |
| fiscal-years-master | 7 | `e2fdfb210fe8576c90f77e555f0da8b731dfc15d2bd9a2002fcd913f4901e887` |
| fiscal-years-master | 9 | `6a94a83342ad49d559893d59214ab8bc697ed00ed0abc411875cdd5a94a67bd6` |
| fiscal-years-api | 8 | `8ab3db43e90da415c85d888ed99bee69d8defd0c62f107f2a6fed1994174ad94` |
| fiscal-years-api | 9 | `e6802156db1e14e4b79fe94b30908e1c5e32313abe23d80cda90711a0ad7f5e6` |
| fiscal-years-api | 10 | `5b8ce0adc32dc41cbb93e1626d24d17e3d8a7e1ed177b6f3fa6241c441c10bee` |
| fiscal-years-web | 8 | `e46e54a03b71c5d25ea8647727571d4b305e67fae28e541211b08f63c0d0fa79` |
| fiscal-years-web | 10 | `83e18b5494b84704135792f4a180feb9a4dc19544af04a69d8ce15baa785ad87` |
| fiscal-years-web | 13 | `f5dc0e405de381f45c3c08fef09d4f52c7d3a996be0d0c005f535d718be57033` |
| fiscal-years-mobile | 2 | `104021a84636098858e2c39aca079d2288b8d27ad6356d8a185339f1771f1484` |
| fiscal-years-mobile | 11 | `e9554663aafac0e73cc879def0bd6a7f77caf44209e7ce53c0df2d2d9b6506b9` |
| fiscal-years-mobile | 12 | `3c2c8033d8473b5a87e710bcd493bd306471022ce5a27fb83521c8db60f8c3e9` |
| fiscal-years-mobile | 15 | `271b0c79f5c2fa68e88f9d30f9c456a963db379a01e8becd335fb935ad2b7434` |
