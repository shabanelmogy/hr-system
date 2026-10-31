<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Angular shared reference selection foundation Phase 03 - Expo Mobile Client

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

- **Angular shared reference selection foundation cross-platform master review:** `../modules/platform/features/angular-reference-selection-foundation/angular-reference-selection-foundation-review.md` sections 3, 4, 6, 7
- **Angular shared reference selection foundation Expo implementation profile:** `../modules/platform/features/angular-reference-selection-foundation/angular-reference-selection-foundation-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-reference-selection-foundation-master | 3 | `89001f0f82ef697025a5065360e679728b8a9a66d431f15041a7c4a82b663fea` |
| angular-reference-selection-foundation-master | 4 | `298f39e8f9b7fd7822edce0f1349b6c89c18b2c702901c2255a8e0a25282b9f2` |
| angular-reference-selection-foundation-master | 6 | `f23c5727ad7a87ce9eed57a1ed99d3d6c842ba51ae556b0be17649845c404a16` |
| angular-reference-selection-foundation-master | 7 | `f302fc3abbe2c2596bc26d7c93965dd5d36a9f9c85e13b2fd843ae9674b49465` |
| angular-reference-selection-foundation-mobile | 1 | `1ecd36f0f84fb8e830c2e7fdca7b2a8edfc3d311b1e55f70ea5ea5bf585539b5` |
| angular-reference-selection-foundation-mobile | 2 | `537611928d4ad534cb9ca0e397c9acbcf72e233ccfdbb56417fa922dd41c63c4` |
| angular-reference-selection-foundation-mobile | 3 | `89001f0f82ef697025a5065360e679728b8a9a66d431f15041a7c4a82b663fea` |
| angular-reference-selection-foundation-mobile | 4 | `298f39e8f9b7fd7822edce0f1349b6c89c18b2c702901c2255a8e0a25282b9f2` |
| angular-reference-selection-foundation-mobile | 5 | `e7255f0794a2b4f0a3e64af0a6d7b202cd9bc75cc83b4e612decfd22facb43d9` |
| angular-reference-selection-foundation-mobile | 6 | `f23c5727ad7a87ce9eed57a1ed99d3d6c842ba51ae556b0be17649845c404a16` |
| angular-reference-selection-foundation-mobile | 7 | `f302fc3abbe2c2596bc26d7c93965dd5d36a9f9c85e13b2fd843ae9674b49465` |
| angular-reference-selection-foundation-mobile | 8 | `6a2b5a31d342ee7f4b5d95bf35cb98c65de7e9bc88c0218f080411461abbbeba` |
| angular-reference-selection-foundation-mobile | 9 | `e0cae5b9f75bda3965fbb2f4a7484fc6fe1da3799a7f9cd5b990b855b5c7216b` |
| angular-reference-selection-foundation-mobile | 10 | `3dc1fc0618d3a5213ece8855cc506bb6a802c6f5b514953ce804fdc8e569ab93` |
| angular-reference-selection-foundation-mobile | 11 | `ab8a7910fbd3887fd970ce73c314a0edb77a9bc31ea92718e1c0a7e52125331c` |
| angular-reference-selection-foundation-mobile | 12 | `5e7ee30f9514eda6d7646df4ed1a8b48c021294a9858a7d367ca023d78107fad` |
| angular-reference-selection-foundation-mobile | 13 | `8a0e9b2afd08ee458dc726db082d539dda2fb85dc081256d7da2685c46f728fb` |
| angular-reference-selection-foundation-mobile | 14 | `c87dcc831c9c118ead7cdba58939b37332a68c9cce35b62118efb7b8cfb9c40a` |
| angular-reference-selection-foundation-mobile | 15 | `c998942c4a4625d1665614da6ec46fefbea425abcad16ab8867719a5b2c3c83c` |
