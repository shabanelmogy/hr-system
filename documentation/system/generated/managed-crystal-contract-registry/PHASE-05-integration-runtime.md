<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Managed Crystal Contract Registry Phase 05 - Integration and Runtime

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

- **Managed Crystal Contract Registry cross-platform master review:** `../project/MANAGED_CRYSTAL_CONTRACT_REGISTRY_FEATURE_FULL_REVIEW.md` sections 4, 5, 6, 7, 9
- **Managed Crystal Contract Registry API implementation profile:** `../api/ManagedCrystalContractRegistry_API_Implementation_Profile.md` sections 8, 9, 10
- **Managed Crystal Contract Registry Next.js implementation profile:** `../web-next/features/managed-crystal-contract-registry-frontend-reference.md` sections 8, 10, 13
- **Managed Crystal Contract Registry Expo implementation profile:** `../mobile-react/managed-crystal-contract-registry-mobile-reference.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-contract-registry-master | 4 | `8f299058d6b0fa1871fc583289549498805511fc5edcd4283b6cd1f6fb06f516` |
| managed-crystal-contract-registry-master | 5 | `06142cc7aa005dbdbec4378418ba9f97c50e22ef70afc05dd4ffe1390a949f95` |
| managed-crystal-contract-registry-master | 6 | `e987bebc42adb87b9650b15783b0f6a5619c9207ba2a847e75674a4775c40e24` |
| managed-crystal-contract-registry-master | 7 | `650941c9496a8555d485db43353c67ba57b588414dc301a23d8dce4ac5d415bb` |
| managed-crystal-contract-registry-master | 9 | `9c9c40542018224adc2f0ff57ad311685b6da773da9766a292397cc275049095` |
| managed-crystal-contract-registry-api | 8 | `4593669845c25df873284a06dbadc97c7e2d29c6b52cf4bb4f9968a227e5f6d9` |
| managed-crystal-contract-registry-api | 9 | `335282f390d3ced85346c45a0e4e8f548e2be6f5a4ec483fc507578329901db0` |
| managed-crystal-contract-registry-api | 10 | `946142661a68c5e3852151f10a8b14bb82f665bf0003c1cabfbb45bd5185121f` |
| managed-crystal-contract-registry-web | 8 | `d04671b611c64713bff2e7947b3e12348da0575350039ffbbbc914ee2ee48322` |
| managed-crystal-contract-registry-web | 10 | `75d4057d55878ca42e7cf3d16c4231abd585347167a180df8c75d0fde5ab1bbd` |
| managed-crystal-contract-registry-web | 13 | `b2bac052ae6ff5bbc4a7157323e5e38363317db4b2ceb125af3b34e363d188f9` |
| managed-crystal-contract-registry-mobile | 2 | `529b05ea902e1b72f795cc3b631837a039e1e417b35fdc41d130303fe6abc21f` |
| managed-crystal-contract-registry-mobile | 11 | `cba911103ac459014c19924ea5628fb9673222c8e3e1d76ecc1cd49afa7c35f7` |
| managed-crystal-contract-registry-mobile | 12 | `96bd27e203dfb9f94ae22fdc087b23d7b0b1129b646ef6400c09a86f743b5bb7` |
| managed-crystal-contract-registry-mobile | 15 | `427b4e3385025a3de716d50a97c2fddb3cc82dd28705db33dc0ee3099a1b04ae` |
