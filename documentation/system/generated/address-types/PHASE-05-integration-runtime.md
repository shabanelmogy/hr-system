<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Address Types Phase 05 - Integration and Runtime

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

- **Address Types cross-platform master review:** `../project/ADDRESS_TYPES_FEATURE_FULL_REVIEW.md` sections 4, 5, 6, 7, 9
- **Address Types API implementation profile:** `../api/AddressTypes_API_Implementation_Profile.md` sections 8, 9, 10
- **Address Types Next.js implementation profile:** `../web-next/features/address-types-frontend-reference.md` sections 8, 10, 13
- **Address Types Expo implementation profile:** `../mobile-react/address-types-mobile-reference.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| address-types-master | 4 | `7308f8020bdbc0c722447f200a173af87d8fa4f5f3fb6bf250463bd9f057ef5a` |
| address-types-master | 5 | `c31995a8d7c1c03131d3084fd78c2df2bd9034552868155d478365f5045521e3` |
| address-types-master | 6 | `38ba2cceb96c08e8c3815c45b40fc5ef311b74eb1e6e3095936183f7ac67aeb4` |
| address-types-master | 7 | `78e6057906c656526f8fb427486cc0fcf24d5fd8fb865fdb58d0a786b9cce3ba` |
| address-types-master | 9 | `d27f68fbce7c132d9111b39903b39f4ef64ade452789cfb3b25cff974a4742d2` |
| address-types-api | 8 | `cdb4949380cc226db6ab4f53b730f5b4fd93333e08d1f8deef641ea2c1e2c358` |
| address-types-api | 9 | `9eac4ef8037553fd9cd38e3c7775bcb54bc0cc69d5623ebef2f804da7c5427a5` |
| address-types-api | 10 | `a6b047ce552f06a101f0d842e1d2a5073f8422c48228f4a1f548e88a7a481079` |
| address-types-web | 8 | `9105872832cbff57378bc222233612b39548d236abe7f34bb04952991ac33862` |
| address-types-web | 10 | `c2cdf3771a6b183cb0847c55998197858b11f5c7cf93eb003ea42af587ed1dbd` |
| address-types-web | 13 | `2bd84244023861a16a3969ed4ce8128912ee46de5ae8b9cf76fe928dd7480d5f` |
| address-types-mobile | 2 | `90348c7f9a0edf3bdd9ed0fc93ba14f932b2d50b4344841749965a2f5d7d5e87` |
| address-types-mobile | 11 | `6728484eaad5c096796aba4b1c30c8e72109a355c1b087d00688e38426f88e98` |
| address-types-mobile | 12 | `0962664fa05ebebe56976f4ae35716f2ed427bdd21a8fabe8af7197b72b7c307` |
| address-types-mobile | 15 | `22bf074cab1a83481fef4c63b81aaa5747d0fc1f013506c2e02e2c2cc1ba7f7f` |
