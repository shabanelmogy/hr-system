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

- **Managed Crystal Template Validation cross-platform master review:** `../project/MANAGED_CRYSTAL_TEMPLATE_VALIDATION_FEATURE_FULL_REVIEW.md` sections 4, 5, 6, 7, 9
- **Managed Crystal Template Validation API implementation profile:** `../api/ManagedCrystalTemplateValidation_API_Implementation_Profile.md` sections 8, 9, 10
- **Managed Crystal Template Validation Next.js implementation profile:** `../web-next/features/managed-crystal-template-validation-frontend-reference.md` sections 8, 10, 13
- **Managed Crystal Template Validation Expo implementation profile:** `../mobile-react/managed-crystal-template-validation-mobile-reference.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-template-validation-master | 4 | `ad565be28727a67b728477a4afa8f58cf6868f6ecd2f9bf5f7b59400f43d8141` |
| managed-crystal-template-validation-master | 5 | `7ac12d3c5d8e8c80a11904919f54556481ff4eafc53e0b77aaa7a4925381dfb1` |
| managed-crystal-template-validation-master | 6 | `fa456baddc6f73079e396b08f3b2fa608267e66d8d1d2f71036708a8182094ee` |
| managed-crystal-template-validation-master | 7 | `b512f756c88e034603039e7120d247c983a4b43461804df33719930033bff007` |
| managed-crystal-template-validation-master | 9 | `9b47e18558b21a5532f013be086220bd6652abb68e3ce0b1b231c1e177c56866` |
| managed-crystal-template-validation-api | 8 | `d6a3c1c59c1b9eeaf3bc531392ef5f1b7044e855ee5825037e34c4ec110f705c` |
| managed-crystal-template-validation-api | 9 | `0b7d25abfe95224d05a59bc890b6e52afe7d0277e27fbbaf993b8c5c79bdec51` |
| managed-crystal-template-validation-api | 10 | `16b287f37a94892dd07d906d9770665db062dbf49be1da57f5104f5f5aec38a1` |
| managed-crystal-template-validation-web | 8 | `ecb5999ee26ee23d8b2b38c1669f4d1cc36673237994d9a061ded63e3f363bfe` |
| managed-crystal-template-validation-web | 10 | `6f539f1c2cd501bd204de298099db59b8404cfba4dbfb4ee6f7eb65741020d44` |
| managed-crystal-template-validation-web | 13 | `91afdb997f851ddb7a519cdd64592cfb4c27c28bf535af6389ea3896d06d37da` |
| managed-crystal-template-validation-mobile | 2 | `38da4c439f0f4139ceb379d80b9190dc0c295e3437adeefd07a547993a65791c` |
| managed-crystal-template-validation-mobile | 11 | `5672496b98a9f152da931ed1a474c686e930755ce7d91075d7d86dd0fd20b392` |
| managed-crystal-template-validation-mobile | 12 | `cc86fd31fc69bc98c71e4ad9aa9ab6be506748656eaeecd56df3aae440c18efb` |
| managed-crystal-template-validation-mobile | 15 | `46969692a043ce56f23bf1a8245cc243a1bbe0d633fcf400cbba816ad52bffcb` |
