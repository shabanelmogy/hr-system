<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Tenant module entitlements Phase 05 - Integration and Runtime

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

- **Tenant module entitlements cross-platform master review:** `../project/TENANT_MODULE_ENTITLEMENTS_FEATURE_FULL_REVIEW.md` sections 4, 5, 6, 7, 9
- **Tenant module entitlements API implementation profile:** `../api/TenantModuleEntitlements_API_Implementation_Profile.md` sections 8, 9, 10
- **Tenant module entitlements Next.js implementation profile:** `../web-next/features/tenant-module-entitlements-frontend-reference.md` sections 8, 10, 13
- **Tenant module entitlements Expo implementation profile:** `../mobile-react/tenant-module-entitlements-mobile-reference.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| tenant-module-entitlements-master | 4 | `e555dc9d04feebee880d75fafd06d4fa2c525673d99cc4476055e8b15cfe36ab` |
| tenant-module-entitlements-master | 5 | `33487ff92f7cbe8016aefa881fa307cdd8cd24645d06255261b68bcdcf41b1c9` |
| tenant-module-entitlements-master | 6 | `5dda69ba2342bfa1f8caee1dee1868a383b4d7c1ce1f7596a753e20c4aba1cfb` |
| tenant-module-entitlements-master | 7 | `fe1349efb104547e5f048e64174e844f17ad248fb17f5e0c7c4e14334bc8213f` |
| tenant-module-entitlements-master | 9 | `60c69fc638e2b14a82907e3c7d6c6a9b1df99042b776f0ba848ff33754256bfe` |
| tenant-module-entitlements-api | 8 | `c37c50acf4176e243388ef9a13427e4eae964c0da2d59c75c49a3ca3f8226094` |
| tenant-module-entitlements-api | 9 | `0adb2ee75634988ab88fd78d7351ee7fc600985d803b15bb47e399b0144152f9` |
| tenant-module-entitlements-api | 10 | `bcc7ef77c03aba1632b982232bdf6c92b819081cab9cb1805446bd76096aaf6b` |
| tenant-module-entitlements-web | 8 | `d4c14b4558540d754cb3e913b31c7e64094dae39e2379900ab39260604f220bf` |
| tenant-module-entitlements-web | 10 | `c9741f4295a0f3bfcef368eb33169cf605fe7780f4da9e426f973be8201c681b` |
| tenant-module-entitlements-web | 13 | `8d4e22b075f697513becfe7f146ec4fa5f7448c429f001a46927bb8b448c0529` |
| tenant-module-entitlements-mobile | 2 | `b422902bf641ac79bba50eccfe3a77f6b14e1341e53b7fefcf5e974903253122` |
| tenant-module-entitlements-mobile | 11 | `405a054943b4eeb6d2ab063900a2db8e31abcf04368e15f78ca3f9ce98d21f2f` |
| tenant-module-entitlements-mobile | 12 | `d36cebfaa781c995c7776ebc740b7499f4b16bcdc07d9f5f556e5ffbcc7ad755` |
| tenant-module-entitlements-mobile | 15 | `32851ba2d1639f1c905ebf6269b6f55623aa6856171421fed3edd2ce5034715c` |
