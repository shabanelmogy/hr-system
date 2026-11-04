<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Managed Crystal Template Validation Phase 05 - Integration and Runtime

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

- **Managed Crystal Template Validation cross-platform master review:** `../modules/reporting/features/managed-crystal-template-validation/managed-crystal-template-validation-review.md` sections 4, 5, 6, 7, 9, 11, 12, 13, 14
- **Managed Crystal Template Validation API implementation profile:** `../modules/reporting/features/managed-crystal-template-validation/managed-crystal-template-validation-api.md` sections 8, 9, 10, 12, 13, 14, 15
- **Managed Crystal Template Validation Next.js implementation profile:** `../modules/reporting/features/managed-crystal-template-validation/managed-crystal-template-validation-web.md` sections 8, 10, 13, 15, 16, 17, 18
- **Managed Crystal Template Validation Expo implementation profile:** `../modules/reporting/features/managed-crystal-template-validation/managed-crystal-template-validation-mobile.md` sections 2, 11, 12, 15, 16, 17, 18, 19

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-template-validation-master | 4 | `ad565be28727a67b728477a4afa8f58cf6868f6ecd2f9bf5f7b59400f43d8141` |
| managed-crystal-template-validation-master | 5 | `7ac12d3c5d8e8c80a11904919f54556481ff4eafc53e0b77aaa7a4925381dfb1` |
| managed-crystal-template-validation-master | 6 | `fa456baddc6f73079e396b08f3b2fa608267e66d8d1d2f71036708a8182094ee` |
| managed-crystal-template-validation-master | 7 | `b512f756c88e034603039e7120d247c983a4b43461804df33719930033bff007` |
| managed-crystal-template-validation-master | 9 | `9b47e18558b21a5532f013be086220bd6652abb68e3ce0b1b231c1e177c56866` |
| managed-crystal-template-validation-master | 11 | `3f41bb5a4d3db8359baeb00d8f408d1a627398ed0bb65686eb5289ae3806d272` |
| managed-crystal-template-validation-master | 12 | `f82b7aff75cf17c21b7c81eb688638474e323eb05c2bb728734c4264fba1f712` |
| managed-crystal-template-validation-master | 13 | `0fd76edfc5407361816949b20ba8a0fbfa30fcea04c0b92bb23ab9bf543e5d96` |
| managed-crystal-template-validation-master | 14 | `65d5e3778b817b758e6462edcfef72ca7d15c7ec943e3049fff328a15e7f025b` |
| managed-crystal-template-validation-api | 8 | `d6a3c1c59c1b9eeaf3bc531392ef5f1b7044e855ee5825037e34c4ec110f705c` |
| managed-crystal-template-validation-api | 9 | `0b7d25abfe95224d05a59bc890b6e52afe7d0277e27fbbaf993b8c5c79bdec51` |
| managed-crystal-template-validation-api | 10 | `16b287f37a94892dd07d906d9770665db062dbf49be1da57f5104f5f5aec38a1` |
| managed-crystal-template-validation-api | 12 | `d8b71662b09abda042effb5b5979aa6a29e6bba2fcc9f92a1998958188d44ecd` |
| managed-crystal-template-validation-api | 13 | `905afaf4256b7e50b2ff7323ae416832ae26d685997a63d32c5b67e4a13e7912` |
| managed-crystal-template-validation-api | 14 | `74e23a0061a413d4bcb719fe916892cde052ba634870c0905a5b547c9de29a32` |
| managed-crystal-template-validation-api | 15 | `970f562ea88dc0ff462fa6bd28307c47c3980cb5524d74d2f4ad7db187dbb6bf` |
| managed-crystal-template-validation-web | 8 | `ecb5999ee26ee23d8b2b38c1669f4d1cc36673237994d9a061ded63e3f363bfe` |
| managed-crystal-template-validation-web | 10 | `6f539f1c2cd501bd204de298099db59b8404cfba4dbfb4ee6f7eb65741020d44` |
| managed-crystal-template-validation-web | 13 | `91afdb997f851ddb7a519cdd64592cfb4c27c28bf535af6389ea3896d06d37da` |
| managed-crystal-template-validation-web | 15 | `71ffd06889cb60c076af3477beeb2cbd52eb6d79637070b86260a6c6a3a5b5a9` |
| managed-crystal-template-validation-web | 16 | `92f766b38be7067a49e3e4ec14ee504f576e615feca8933e6343bff2dc76222e` |
| managed-crystal-template-validation-web | 17 | `f725d9892667343198dda4470b74910f0fb9c8bf9585ca1d8f34b4e9973f7b19` |
| managed-crystal-template-validation-web | 18 | `5491240deb33af6bad5272dd5c39e038f87e09ab9cd06ec50853701da767a388` |
| managed-crystal-template-validation-mobile | 2 | `38da4c439f0f4139ceb379d80b9190dc0c295e3437adeefd07a547993a65791c` |
| managed-crystal-template-validation-mobile | 11 | `5672496b98a9f152da931ed1a474c686e930755ce7d91075d7d86dd0fd20b392` |
| managed-crystal-template-validation-mobile | 12 | `cc86fd31fc69bc98c71e4ad9aa9ab6be506748656eaeecd56df3aae440c18efb` |
| managed-crystal-template-validation-mobile | 15 | `74f7d3fc128a5ecc2d1730de6f975b594afae7f3b3623823a55e60ab37e182f8` |
| managed-crystal-template-validation-mobile | 16 | `d21f20f467817757e3187ecebcdd0a53aa5c5dc6d2880a0cd11f92ed815d6e8b` |
| managed-crystal-template-validation-mobile | 17 | `b0834738d4c76cf8d337d5d8e58445e410821856d8cdd9b374f9d9742e4e99ff` |
| managed-crystal-template-validation-mobile | 18 | `185541b1009cb128d62ed9ca6765e8577221a8470d0d65a6fe29964f23da6c30` |
| managed-crystal-template-validation-mobile | 19 | `96dc4deaf700e4e8b5383efb25e3f05edeea2942f22648c41390b900927db9af` |
