<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Shared scoped read lifecycle preparation Phase 03 - Expo Mobile Client

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

- **Shared scoped read lifecycle preparation cross-platform master review:** `../modules/platform/features/angular-scoped-read-lifetime-foundation/angular-scoped-read-lifetime-foundation-review.md` sections 3, 4, 6, 7
- **Shared scoped read lifecycle preparation Expo implementation profile:** `../modules/platform/features/angular-scoped-read-lifetime-foundation/angular-scoped-read-lifetime-foundation-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-scoped-read-lifetime-foundation-master | 3 | `1cf14f0f0e123856ed661ef55f6d39ef96b02e0702b89675460f60523f358baf` |
| angular-scoped-read-lifetime-foundation-master | 4 | `fe22ce8087188029336855eb16ec1e82797e034f78d0a17de9ebcfe967f56835` |
| angular-scoped-read-lifetime-foundation-master | 6 | `b1ed3701da1066a418fd9708b7074be2ee8ec02e1aec3eae95b3a5fd7932e45f` |
| angular-scoped-read-lifetime-foundation-master | 7 | `0e2559819911bcd2239cd56e19d5829f4de4f8bc29794dc7b1a0745ebd677f26` |
| angular-scoped-read-lifetime-foundation-mobile | 1 | `affab6a6bae3ef30b7a8ec0acb620d08dbf7ab3c145a5ea8f00a521d1ac89f34` |
| angular-scoped-read-lifetime-foundation-mobile | 2 | `1bb9daf1545478de79c557020442733fa754af50a233daa5573cfde1c1724bcd` |
| angular-scoped-read-lifetime-foundation-mobile | 3 | `1cf14f0f0e123856ed661ef55f6d39ef96b02e0702b89675460f60523f358baf` |
| angular-scoped-read-lifetime-foundation-mobile | 4 | `fe22ce8087188029336855eb16ec1e82797e034f78d0a17de9ebcfe967f56835` |
| angular-scoped-read-lifetime-foundation-mobile | 5 | `7032fb41fa7fb04596774df8bf48965cb55dcd7da1690659abf5038c3dddee05` |
| angular-scoped-read-lifetime-foundation-mobile | 6 | `b1ed3701da1066a418fd9708b7074be2ee8ec02e1aec3eae95b3a5fd7932e45f` |
| angular-scoped-read-lifetime-foundation-mobile | 7 | `0e2559819911bcd2239cd56e19d5829f4de4f8bc29794dc7b1a0745ebd677f26` |
| angular-scoped-read-lifetime-foundation-mobile | 8 | `1f828870c40492b5373285085bdbdd3baed7160e0ab16279f29f7886293254c9` |
| angular-scoped-read-lifetime-foundation-mobile | 9 | `40c959e2c189d36d2616af34473c0acaf8e389ee88a9844d27c10ac7767682ef` |
| angular-scoped-read-lifetime-foundation-mobile | 10 | `0375ed805314d411457a3111f0e06abbc07908f2541f02c9588a834a24f36b52` |
| angular-scoped-read-lifetime-foundation-mobile | 11 | `e26d99a0a657ccafbb59bd2de87c3d7f447cf25a3239c9ea26f0a39b952de8fc` |
| angular-scoped-read-lifetime-foundation-mobile | 12 | `83c84ad268b229bca4c4b1e1917ab3585f88c1f024376d0c01c100ab72a9dab3` |
| angular-scoped-read-lifetime-foundation-mobile | 13 | `9dbd734d9f7fa9887a086f61f728bdf098c0879e84f30ff462ca2c2fde9fdaa0` |
| angular-scoped-read-lifetime-foundation-mobile | 14 | `b9f8f64bea6b8ba01b4e432c16b80039a7347a488149603ac1f4c4613ecc9b54` |
| angular-scoped-read-lifetime-foundation-mobile | 15 | `4ec4717c052e3bd05ffd044457f074133397f2a7ddec46eab6a6dc83cd9a3d87` |
