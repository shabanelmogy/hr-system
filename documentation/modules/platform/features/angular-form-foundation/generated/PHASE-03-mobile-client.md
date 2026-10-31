<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Angular Shared Text Fields and Form Submission Phase 03 - Expo Mobile Client

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

- **Angular Shared Text Fields and Form Submission cross-platform master review:** `../modules/platform/features/angular-form-foundation/angular-form-foundation-review.md` sections 3, 4, 6, 7
- **Angular Shared Text Fields and Form Submission Expo implementation profile:** `../modules/platform/features/angular-form-foundation/angular-form-foundation-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-form-foundation-master | 3 | `1c07ac405eb9a9da732bbc2cd5d3043d903b7d7fee12ac491660742dcf928262` |
| angular-form-foundation-master | 4 | `1b47dfc85b7c0c905a5cfc0e75f64cdc37b04cf1e47a64acd27ba7fb18fe99c9` |
| angular-form-foundation-master | 6 | `4c846e1af1e4f8be32a79a58ff2f272759a316890b776c9960c0096a4661669a` |
| angular-form-foundation-master | 7 | `e46cfce5be74e89543f3d8ad5ef40f3640578392f7f72abee376d81c0041bcf8` |
| angular-form-foundation-mobile | 1 | `3faf7c7e731326a9d26b46946abe7eb9059ff63cb8eec7a8ac2055308cf6fc84` |
| angular-form-foundation-mobile | 2 | `f2251a944a00c8155b578e2ac7e59625798f5ab536762ef52fd00529ba0982d6` |
| angular-form-foundation-mobile | 3 | `1c07ac405eb9a9da732bbc2cd5d3043d903b7d7fee12ac491660742dcf928262` |
| angular-form-foundation-mobile | 4 | `1b47dfc85b7c0c905a5cfc0e75f64cdc37b04cf1e47a64acd27ba7fb18fe99c9` |
| angular-form-foundation-mobile | 5 | `c6d1c95cb6dfb29c3a4eb08fcf1592391d0d06246967c3fab9725067f8bc2687` |
| angular-form-foundation-mobile | 6 | `4c846e1af1e4f8be32a79a58ff2f272759a316890b776c9960c0096a4661669a` |
| angular-form-foundation-mobile | 7 | `c6d5ff03d7bc3473e029f741dcbc7fb01fe09f9570daed1760f3d5e83415b153` |
| angular-form-foundation-mobile | 8 | `8e9a6c65ec70640c0b36054bd0f77faedfee71f12d1eb28d45398ddfb7365b67` |
| angular-form-foundation-mobile | 9 | `9e69e079b4dcc5b2ca68cde1376645625bb85e1030a5da4e8083eb9453d322ee` |
| angular-form-foundation-mobile | 10 | `7cef5c81383b73aa3f407c82f8fbd0dd848ef5b67a6e2f0eb8adfb995ec8d14c` |
| angular-form-foundation-mobile | 11 | `391d65f6b02080f8b4bacf2293b5a07a1aa69f834d784a1d94b4bb86400ee81c` |
| angular-form-foundation-mobile | 12 | `70f10c72924980a36133310b0a7b4dc18511cb110b18323a79dd960adcbc8be3` |
| angular-form-foundation-mobile | 13 | `d369cbf630d95eb29023602fbe352a2095526c95a1d43009ad38382a265e53c6` |
| angular-form-foundation-mobile | 14 | `31cf6ca8ba62d489b09c1844f693f761227241e974459440821f57be559bf031` |
| angular-form-foundation-mobile | 15 | `54f8cda59095ce454f27c117ced12176d1875b32cd22697e8b4351e002588c77` |
