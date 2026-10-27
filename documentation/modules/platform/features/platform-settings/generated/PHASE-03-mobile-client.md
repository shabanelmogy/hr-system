<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Platform Settings Phase 03 - Expo Mobile Client

## Purpose

Implement the Expo client as a native presentation of the shared contract, using the same server-list and lifecycle semantics as web.

Execution reference: `documentation/guides/mobile/MOBILE_FEATURE_GUIDE.md`.

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

- **Platform Settings cross-platform master review:** `../modules/platform/features/platform-settings/platform-settings-review.md` sections 3, 4, 6, 7
- **Platform Settings Expo implementation profile:** `../modules/platform/features/platform-settings/platform-settings-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| platform-settings-master | 3 | `62db90956ab6487883efb3c81f5ef78e05f291c3128abba4724d1d8ee3263e86` |
| platform-settings-master | 4 | `1e6e30d327293c1ef34116ee5580e98d7b008fe943f3ebb221db1c5c4df40ea0` |
| platform-settings-master | 6 | `561a04d004f55425502034332d421de9b0ac65843d053222311168511572cd1f` |
| platform-settings-master | 7 | `ba48ae018c9641925daf2835ba4e18577f257124b3312244495b5ed7da6b1fad` |
| platform-settings-mobile | 1 | `e3a13cfa13d276c8425b02919e79d54db7855138388d42d45a1135e979ca37c2` |
| platform-settings-mobile | 2 | `bb945b74ccca2581a9d6a3dbafa3fde16c98fab95d2c83d555ab0f27d16d7b8f` |
| platform-settings-mobile | 3 | `7be2c3db3d4069d892080e4ef861fa6bcababa110db9fc10a048fa9a908d1463` |
| platform-settings-mobile | 4 | `3d730ca868c7b1b1e8d004c84b40a88238e6f777ee0d46f06a5359b2c9f72a6c` |
| platform-settings-mobile | 5 | `27fd6e36191b94f669eda66896e7f05005c30ea0e3ec27db58d885118d1fc998` |
| platform-settings-mobile | 6 | `06ba157c8ef0ad4323d313830203bc48c155deca899a14ca2c00bb69cd0fa306` |
| platform-settings-mobile | 7 | `9d6e841ac90238d82b717d7a071df7b7bc69cb34f5fea58acd791d38dc5ca1e8` |
| platform-settings-mobile | 8 | `46e7d7fa67a5c598d4c21ca18ce8b97113ef6e5e34edfd93ef25c7d589ccbcb7` |
| platform-settings-mobile | 9 | `2bcad9792901da71b26b7978ae0d7f7c763f65656f89a808594d10921a5a89c3` |
| platform-settings-mobile | 10 | `5097ab4247ee0bbbcb1dc19bac0dd450f6d4d58cb8ae9780913c39608fa6342e` |
| platform-settings-mobile | 11 | `cd598a2c052fe27d3a4df855a05d01e7c846987f9f5a091d2350f1c2cab1623b` |
| platform-settings-mobile | 12 | `e5cacf6ed728d7e0e7fa4b04eed4e34c551ccec6bce0753b1ec4c39ee01eae2b` |
| platform-settings-mobile | 13 | `6ee5f0886727d07c032cb66810b3a65ad8dbbe5522ccb80f01b603304f92818f` |
| platform-settings-mobile | 14 | `182b5133e68570c9349272fc7dcd15b528723e7908f9f8f33fae1388493b0e49` |
| platform-settings-mobile | 15 | `b64bc8a323caaa8c4135b08246c9cd791f1dbc8f4d2429624db41fccb99cd8ef` |
