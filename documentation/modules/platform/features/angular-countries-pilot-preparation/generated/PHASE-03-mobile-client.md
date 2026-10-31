<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Countries pilot preparation Phase 03 - Expo Mobile Client

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

- **Countries pilot preparation cross-platform master review:** `../modules/platform/features/angular-countries-pilot-preparation/angular-countries-pilot-preparation-review.md` sections 3, 4, 6, 7
- **Countries pilot preparation Expo implementation profile:** `../modules/platform/features/angular-countries-pilot-preparation/angular-countries-pilot-preparation-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-pilot-preparation-master | 3 | `501ef0b9eef132639e93fb02b0f8576e649d544ebbbf5196b1247ef045af7682` |
| angular-countries-pilot-preparation-master | 4 | `1c73770cd45e7c8c070200ef9519ac7fd1c97478c2fcba4f3cf85560391068c1` |
| angular-countries-pilot-preparation-master | 6 | `63f6cadc90c5b7a65d7ada2d9804750ba56b1b0b45d29aade44d6131b4c38a06` |
| angular-countries-pilot-preparation-master | 7 | `47a9d24047af73aaf314c020f9296502e9d68a99fba5c5869fa3afcd4a60674d` |
| angular-countries-pilot-preparation-mobile | 1 | `898dd20117fd133d99fd5362d06fb22e1cddec3df90c9eb782f01898d5440119` |
| angular-countries-pilot-preparation-mobile | 2 | `ef54c6e76fe4a7268ce85507ba52fa3ca1ab5d4a9903be2815811016b72a9ff2` |
| angular-countries-pilot-preparation-mobile | 3 | `501ef0b9eef132639e93fb02b0f8576e649d544ebbbf5196b1247ef045af7682` |
| angular-countries-pilot-preparation-mobile | 4 | `1c73770cd45e7c8c070200ef9519ac7fd1c97478c2fcba4f3cf85560391068c1` |
| angular-countries-pilot-preparation-mobile | 5 | `d8bd919c83a5678c9ebdddfcf75f989e353d963870222c1a5f116e0f2b20fc5d` |
| angular-countries-pilot-preparation-mobile | 6 | `63f6cadc90c5b7a65d7ada2d9804750ba56b1b0b45d29aade44d6131b4c38a06` |
| angular-countries-pilot-preparation-mobile | 7 | `47a9d24047af73aaf314c020f9296502e9d68a99fba5c5869fa3afcd4a60674d` |
| angular-countries-pilot-preparation-mobile | 8 | `6de19e9783c84f5dae33a0930b620ad41f23271249357863cc6b5674b112db4e` |
| angular-countries-pilot-preparation-mobile | 9 | `cf8e09d2816484ef5fe1b3d550ed61098cb7739b6e69934182c068724c7fab6b` |
| angular-countries-pilot-preparation-mobile | 10 | `99ebce40b5bf08863732dc80464d3f3199aa700b4358f38675af7ba7e1caf6f3` |
| angular-countries-pilot-preparation-mobile | 11 | `d76489077b244af829c6b552caf7e3b93e3292389e9991d164156b42530b0983` |
| angular-countries-pilot-preparation-mobile | 12 | `a2d8cff8774ebb01edf2964ca642abaceb53663ba44331324393623d62edf1ba` |
| angular-countries-pilot-preparation-mobile | 13 | `416c59ea487734c49a1540d2ed034f83c46d37aa68e98c1c1de183b8d88b66c5` |
| angular-countries-pilot-preparation-mobile | 14 | `7496e9d4d4a7a142c3b65621b7c782cac6b2513f2f0e5a50c4d1b01df51e07e2` |
| angular-countries-pilot-preparation-mobile | 15 | `38375d4db92df52da4cf83a7118215da66b9480f25edf3ae999379a5b5d8f71e` |
