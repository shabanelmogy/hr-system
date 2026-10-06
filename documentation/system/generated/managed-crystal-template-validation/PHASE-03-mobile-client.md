<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Managed Crystal Template Validation Phase 03 - Expo Mobile Client

## Purpose

Implement the Expo client as a native presentation of the shared contract, using the same server-list and lifecycle semantics as web.

Execution reference: `documentation/mobile-react/MOBILE_FEATURE_GUIDE.md`.

## Required structure

- Thin Expo Router file and a typed route constant.
- Route-manifest permission guard and navigation entry.
- Feature public API plus feature-owned schemas, endpoint wrappers, query keys, hooks, screen, cards, form, report, and tests.
- Shared list state, data table, form, screen, header, feedback, and responsive primitives.

## Read and interaction checks

- [ ] Zero-based device state converts to one-based API paging once.
- [ ] Search, filters, sort, page, page size, and selection have one owner.
- [ ] Search or filter changes clear stale bulk selection and reset paging.
- [ ] Table and card modes consume the same page and server total.
- [ ] Compact widths, touch targets, safe areas, keyboard avoidance, and orientation changes are verified.
- [ ] English, Arabic, RTL ordering, labels, validation, and screen-reader names are verified.
- [ ] Read-only mode and permissions disable every mutation entry point.
- [ ] Archive, restore, bulk, report, notification deep link, and realtime refresh behavior match the API.

## Mobile-specific decisions

Record whether detail requires a dedicated query, whether reports open or share
locally, which filters are exposed on compact screens, and how forms handle
offline or retry states. Classify mobile Import as `Required`, `Deferred`, or
`Excluded` independently from web and record the reason. These decisions may
differ from web but must be explicit.

When mobile Import is Required:

- use a platform-safe document picker and storage API instead of copying browser
  file-input or workbook code;
- consume the same documented API envelope, limits, duplicate rules, dependency
  lookups, atomicity, and stable errors as web;
- provide native loading, preview, permission/read-only, retry, localization, RTL,
  accessibility, and post-success invalidation behavior;
- test picker cancellation, unsupported and oversized files, parsing, exact
  request body, dependency failure, API conflict, retry, and cache refresh.

When mobile Import is Deferred or Excluded, keep the decision in the feature
profile and do not leave an unreachable route, component, or translation surface.

## Evidence to capture

- Physical route, typed route, route-manifest, navigation, endpoint, query-key,
  realtime, notification deep-link, and localization registrations.
- Runtime schema parsing and exact request/query serialization tests.
- Phone/tablet, orientation, safe-area, keyboard, EN/AR, RTL, touch-target,
  screen-reader, permission/read-only, network, retry, and empty-state evidence.

## Approved references

- **Managed Crystal Template Validation cross-platform master review:** `../project/MANAGED_CRYSTAL_TEMPLATE_VALIDATION_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Managed Crystal Template Validation Expo implementation profile:** `../mobile-react/managed-crystal-template-validation-mobile-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-template-validation-master | 3 | `d5750ec782337abb998b935688fe28befe372bebda9f0fc1bdf298453539f145` |
| managed-crystal-template-validation-master | 4 | `ad565be28727a67b728477a4afa8f58cf6868f6ecd2f9bf5f7b59400f43d8141` |
| managed-crystal-template-validation-master | 6 | `fa456baddc6f73079e396b08f3b2fa608267e66d8d1d2f71036708a8182094ee` |
| managed-crystal-template-validation-master | 7 | `b512f756c88e034603039e7120d247c983a4b43461804df33719930033bff007` |
| managed-crystal-template-validation-mobile | 1 | `827f5e601f39968315b01c0a015ad29dbd519239f700eb0315a8861e16063f38` |
| managed-crystal-template-validation-mobile | 2 | `38da4c439f0f4139ceb379d80b9190dc0c295e3437adeefd07a547993a65791c` |
| managed-crystal-template-validation-mobile | 3 | `51d10d223e45c7a77d55c5e5eec7f3044051af877c98884562c43dc23f335511` |
| managed-crystal-template-validation-mobile | 4 | `39b8f03735c5e98f4122da2ffc7353189b3bab10482e113047fce338ae3ac617` |
| managed-crystal-template-validation-mobile | 5 | `5dc353c16b190137bd8948c162757f25762bd7be9af921a022942f5226c022cf` |
| managed-crystal-template-validation-mobile | 6 | `6d9bc5f5fbc9995e11a9b8d91bd8401b1192258917eaec75f5ab6e4f3452ce06` |
| managed-crystal-template-validation-mobile | 7 | `1e22f000e59f5f2a66f26e82a0568b9888ee9dd8eedbf8542790ce36a00a6a2f` |
| managed-crystal-template-validation-mobile | 8 | `eac67e5e8a9d948838423b71b1995b1f38d408514b1e990068b8cc5b2c269a7b` |
| managed-crystal-template-validation-mobile | 9 | `668b40e5d4249969aed1d5d9a87eff4f2dd607a7b9fbd6de8f1c96f42dc0f80e` |
| managed-crystal-template-validation-mobile | 10 | `fe5c66e936be181fca893feb23a30c2c4eb06e89ed0e90e72df4ad20df1adcc9` |
| managed-crystal-template-validation-mobile | 11 | `5672496b98a9f152da931ed1a474c686e930755ce7d91075d7d86dd0fd20b392` |
| managed-crystal-template-validation-mobile | 12 | `cc86fd31fc69bc98c71e4ad9aa9ab6be506748656eaeecd56df3aae440c18efb` |
| managed-crystal-template-validation-mobile | 13 | `19894b7c9abae4cc13bb545ee00c8c259b07dff81af629a1fa0747d373e6fadd` |
| managed-crystal-template-validation-mobile | 14 | `1feffa130d4cb6c760ba751ee8b3189f133f94e9c8a8dc5114e4ee6612aab6ab` |
| managed-crystal-template-validation-mobile | 15 | `46969692a043ce56f23bf1a8245cc243a1bbe0d633fcf400cbba816ad52bffcb` |
