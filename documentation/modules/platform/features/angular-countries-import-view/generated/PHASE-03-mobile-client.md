<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Countries XLSX import Phase 03 - Expo Mobile Client

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

- **Countries XLSX import cross-platform master review:** `../modules/platform/features/angular-countries-import-view/angular-countries-import-view-review.md` sections 3, 4, 6, 7
- **Countries XLSX import Expo implementation profile:** `../modules/platform/features/angular-countries-import-view/angular-countries-import-view-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-import-view-master | 3 | `78341b642b12c6c18a3247c7846ae2be0cff8c1786062f41075aa895918f5dc3` |
| angular-countries-import-view-master | 4 | `53e60870bac7336b7b85981032dd3b9944a2a288a91459982cb0a8c20142c42c` |
| angular-countries-import-view-master | 6 | `3cb1ce59d5da20c1c670d16496538c270effb436933ee0e13048f912397e6a61` |
| angular-countries-import-view-master | 7 | `19d1a25a2d02717bc26c96f2207373eee86a5a2dc4cc5440e012ce32bcac8c81` |
| angular-countries-import-view-mobile | 1 | `d2a71652a5dadf9b2314821fee2a01c14127c7934c30de1acb36c7b21a6c5dc2` |
| angular-countries-import-view-mobile | 2 | `c96148e173107ae3b96ee6247440e6b3d9d69cb7fbba1304df5e66e4328111e2` |
| angular-countries-import-view-mobile | 3 | `78341b642b12c6c18a3247c7846ae2be0cff8c1786062f41075aa895918f5dc3` |
| angular-countries-import-view-mobile | 4 | `53e60870bac7336b7b85981032dd3b9944a2a288a91459982cb0a8c20142c42c` |
| angular-countries-import-view-mobile | 5 | `3673a2c7c459efed4be5b56d814d01b31e1291b7cc3c645b9106386457f5d443` |
| angular-countries-import-view-mobile | 6 | `3cb1ce59d5da20c1c670d16496538c270effb436933ee0e13048f912397e6a61` |
| angular-countries-import-view-mobile | 7 | `19d1a25a2d02717bc26c96f2207373eee86a5a2dc4cc5440e012ce32bcac8c81` |
| angular-countries-import-view-mobile | 8 | `b3c4409235a89b89abcc628d2a834a38b5c30d5793e24bfb207a2c9bcd6f1677` |
| angular-countries-import-view-mobile | 9 | `bbba187c534e0637214cb864a3f268ffdf3dca121eaad7f9d413334fe10dea0d` |
| angular-countries-import-view-mobile | 10 | `47e64969da4971e661128ac73ad0f901ccfd17949c2856ffdd37c0c37bda76c3` |
| angular-countries-import-view-mobile | 11 | `6cb7786af1c177babf51eb605ea16c9cb5f85484c6a2a6d6ea138e39cbf67aa0` |
| angular-countries-import-view-mobile | 12 | `ec1a71bb79a1df59c7669872683dbb8180c0c987562423a18eb8b0e64c12b4be` |
| angular-countries-import-view-mobile | 13 | `4d7bd414678262665b7f89f01a552b43bf3120d65e993916c20f11e45fdc0743` |
| angular-countries-import-view-mobile | 14 | `00543cc395f4ade3ba26da7dca4538c0733b44e06804788e0b9a6dcfbdd6c2b5` |
| angular-countries-import-view-mobile | 15 | `2f531c9e1a7906ca3b77d3d7d45409b64b8d6e107eae70cfc1b6a511ac1c9e8e` |
