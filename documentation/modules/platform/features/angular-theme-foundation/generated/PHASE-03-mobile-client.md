<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Angular Shared Theme and Action Control Phase 03 - Expo Mobile Client

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

- **Angular Shared Theme and Action Control cross-platform master review:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-review.md` sections 3, 4, 6, 7
- **Angular Shared Theme and Action Control Expo implementation profile:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-theme-foundation-master | 3 | `071779e2c74d963bce39981ae360e9ad0206810e48a29edca4473916ce983c68` |
| angular-theme-foundation-master | 4 | `da77c409251d42150cbb611b466e34269a36e417e5afd3890a68836bf33243eb` |
| angular-theme-foundation-master | 6 | `c59b87b10fc969391f2d782547421b84c7d4b47bdf19df5f2b8485949b709791` |
| angular-theme-foundation-master | 7 | `74ab13bcbd7d84010d64cac92472527044e747aca5045560ab602ee00fb3a1d8` |
| angular-theme-foundation-mobile | 1 | `350106b9d165927fccfe97ada1dd90dfe9128de5f0076e9a95a6bcef39eb9c44` |
| angular-theme-foundation-mobile | 2 | `23ebd67dc023b93e3fe4b46bf2d361346ae97d9e9e774aa289e82f4ec0584f7b` |
| angular-theme-foundation-mobile | 3 | `071779e2c74d963bce39981ae360e9ad0206810e48a29edca4473916ce983c68` |
| angular-theme-foundation-mobile | 4 | `da77c409251d42150cbb611b466e34269a36e417e5afd3890a68836bf33243eb` |
| angular-theme-foundation-mobile | 5 | `a866a4bf9fdc929bfb990a70fe575bfc962a4097a68f81e636044e80f620d8d1` |
| angular-theme-foundation-mobile | 6 | `c59b87b10fc969391f2d782547421b84c7d4b47bdf19df5f2b8485949b709791` |
| angular-theme-foundation-mobile | 7 | `2cff86d9180ef938cc6eb291b9aa40dbe078ebd524481859c0239e325959cb47` |
| angular-theme-foundation-mobile | 8 | `ea5867fdb4129cd10c2ee5662de83461d5cad88059d0057d0977147a1f1c022d` |
| angular-theme-foundation-mobile | 9 | `5291c967ab5ed5d278ffe583e1ff21d682be39afc96fb69800728b7da653b36b` |
| angular-theme-foundation-mobile | 10 | `62ccb5d14f2b568616a3cf694d0418404fd96766ba7ca2f3a10538da44834953` |
| angular-theme-foundation-mobile | 11 | `58dc115e8092bcba8eba15cea9974b490796f1bb79ea8dcb5f57f9f9083b5e13` |
| angular-theme-foundation-mobile | 12 | `1551bbf6ddbdcd426aa3759d7ced8fdf0a303c7a5143aba86a4c6e5870592c4b` |
| angular-theme-foundation-mobile | 13 | `13bc8ce32880ebc4901c2ccf67f921e1a34fcffa5dbb2bf3f3e08566adaa8a61` |
| angular-theme-foundation-mobile | 14 | `b654c4c4e8ade2d5e7f21a434b4c89913a1dc05ce33ff6113fbe7b0510cc1f22` |
| angular-theme-foundation-mobile | 15 | `352a451bf107a65df616afa4f9d3d8396b7bfa7bd25b5f00b26f68687a0319ba` |
