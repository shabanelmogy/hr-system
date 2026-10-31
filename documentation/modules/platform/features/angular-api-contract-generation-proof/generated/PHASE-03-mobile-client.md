<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Angular API contract generation compatibility proof Phase 03 - Expo Mobile Client

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

- **Angular API contract generation compatibility proof cross-platform master review:** `../modules/platform/features/angular-api-contract-generation-proof/angular-api-contract-generation-proof-review.md` sections 3, 4, 6, 7
- **Angular API contract generation compatibility proof Expo implementation profile:** `../modules/platform/features/angular-api-contract-generation-proof/angular-api-contract-generation-proof-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-api-contract-generation-proof-master | 3 | `e315e31fc7b1aaeefa3db25c33d5acd3c3ace47d3fa8d611e04f0b744706fada` |
| angular-api-contract-generation-proof-master | 4 | `4ebed5f2b84b04bec2ea90dd08aa6fd428d9534cfc8ad1276b8ce46da124c4fc` |
| angular-api-contract-generation-proof-master | 6 | `b41e2c1eb859488b6ed13dca4845ef329fe82644f1c7c230f10482e4e863f650` |
| angular-api-contract-generation-proof-master | 7 | `56aba998ce7ccc78088ecbbcc5605381bfe63186119ea63a85a2b6e20ca68c32` |
| angular-api-contract-generation-proof-mobile | 1 | `05a1c635c46a3eb0792ec73846b7b313dce0ca8097d044fb38c678d39c1eb44c` |
| angular-api-contract-generation-proof-mobile | 2 | `4175488691af7b51b1d42a1ee43d8077207c2229d6575324f6ef899e2d6c3501` |
| angular-api-contract-generation-proof-mobile | 3 | `e315e31fc7b1aaeefa3db25c33d5acd3c3ace47d3fa8d611e04f0b744706fada` |
| angular-api-contract-generation-proof-mobile | 4 | `4ebed5f2b84b04bec2ea90dd08aa6fd428d9534cfc8ad1276b8ce46da124c4fc` |
| angular-api-contract-generation-proof-mobile | 5 | `49afe2bb4db3fac02f1d86edf857f1f97125d58e1c256407a86f861ded5c87e7` |
| angular-api-contract-generation-proof-mobile | 6 | `b41e2c1eb859488b6ed13dca4845ef329fe82644f1c7c230f10482e4e863f650` |
| angular-api-contract-generation-proof-mobile | 7 | `56aba998ce7ccc78088ecbbcc5605381bfe63186119ea63a85a2b6e20ca68c32` |
| angular-api-contract-generation-proof-mobile | 8 | `fd292d3cec432f44bb98aceb506aa1d3f871da0aed1f145d4b1ce14bcd82c541` |
| angular-api-contract-generation-proof-mobile | 9 | `78ce449fad32387d28b10ac190a7b24314efa780388f75ebc4f3cd34c045783e` |
| angular-api-contract-generation-proof-mobile | 10 | `90e4bcdbf79b13aab5307175b41a047870abb2e21b858362cb7abed7fb17ffab` |
| angular-api-contract-generation-proof-mobile | 11 | `d7e05edb39ab6b7b9b9545940088a607a8d779f955d7fba4b7ae748bdf8c6e4d` |
| angular-api-contract-generation-proof-mobile | 12 | `0a0dddd7214cdaa5198c2c9aeb62d830042248f156d067d10f2f4f28891930f5` |
| angular-api-contract-generation-proof-mobile | 13 | `8eb209af489cfe780f83e4f1313815475d5f669a5d0b2aee6aab18ab9a4c5edf` |
| angular-api-contract-generation-proof-mobile | 14 | `ee5c674e759613eaceb91f95f1e6d561b134004a915a257ee94ae1b4507e052c` |
| angular-api-contract-generation-proof-mobile | 15 | `7a363919fa6d3783cc9f713d10f73ad3f5a91d68eabafbce13e95232c0a0ed0b` |
