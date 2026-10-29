<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Angular Toolchain and Localization Runtime Phase 03 - Expo Mobile Client

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

- **Angular Toolchain and Localization Runtime cross-platform master review:** `../modules/platform/features/angular-localization-foundation/angular-localization-foundation-review.md` sections 3, 4, 6, 7
- **Angular Toolchain and Localization Runtime Expo implementation profile:** `../modules/platform/features/angular-localization-foundation/angular-localization-foundation-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-localization-foundation-master | 3 | `ce20c23bd1cc943f42290794831e6b0955bf48b4df3fb4f72e5e13d85673593f` |
| angular-localization-foundation-master | 4 | `2345e4c0df8f384bba2a2b07fe7e9f102ba3b93096314d620fa8be452461ed41` |
| angular-localization-foundation-master | 6 | `7ef4ef81649a5cf87f78af83589a72bb1d3575294e98efe4da414ab698114f3e` |
| angular-localization-foundation-master | 7 | `c1f5c712a2d2529993fc7f4ac45fc8d015ad29fd934eadae86a2c98f7db5df49` |
| angular-localization-foundation-mobile | 1 | `265fd2b4b95c9c933ce3aef4ccca2b46b645ca9b779d2684869d104faa9be73d` |
| angular-localization-foundation-mobile | 2 | `dbb9c391093ad2e63ab72da54097310c2dfddd667487d0934e43c8bb5ca9c928` |
| angular-localization-foundation-mobile | 3 | `ce20c23bd1cc943f42290794831e6b0955bf48b4df3fb4f72e5e13d85673593f` |
| angular-localization-foundation-mobile | 4 | `2345e4c0df8f384bba2a2b07fe7e9f102ba3b93096314d620fa8be452461ed41` |
| angular-localization-foundation-mobile | 5 | `71dad2ca5b311ecc4d115bee358583247edb7e5498ec4f932e1dc5aa12bf55e9` |
| angular-localization-foundation-mobile | 6 | `7ef4ef81649a5cf87f78af83589a72bb1d3575294e98efe4da414ab698114f3e` |
| angular-localization-foundation-mobile | 7 | `71c0470235eda68a8752ff06690ed3e8e52c2859974eeb5eca9983651165b31e` |
| angular-localization-foundation-mobile | 8 | `ea76c301cccd425a113f3f51a0a51d3aef602e51c8b606d67dcad157be30c5cc` |
| angular-localization-foundation-mobile | 9 | `46fb0447edae1fca09c9986213d9472d157e56cc4c960a40aced27e409d47265` |
| angular-localization-foundation-mobile | 10 | `fe7928624f22f08764dcf7e54d5651be2cb0f41f1930ac527aaa94e00a35faf6` |
| angular-localization-foundation-mobile | 11 | `5dab27474a1b99ba062fd373bdbdb3dd3a8a6fe523b6dbf3da6991fc4335f10e` |
| angular-localization-foundation-mobile | 12 | `4df921c53578650ee76e8a453619da14a1a2cdaa1fad626c8f36e28cfb83d3b8` |
| angular-localization-foundation-mobile | 13 | `a4f2b92cb7b0ddb46e4abfbc3ffd75253df09b1252afe8221c3bde9d44d2dd2e` |
| angular-localization-foundation-mobile | 14 | `8eb0574471e920e016444fe94f7ac5951ad3ffdb506efa474a7154c2ad240f95` |
| angular-localization-foundation-mobile | 15 | `1f0ba56b18e34cf44b7c9c6560feed30a0c7f4b54d243de794be546b475d1ee9` |
