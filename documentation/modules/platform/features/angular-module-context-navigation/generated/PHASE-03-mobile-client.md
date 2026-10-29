<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Angular application context navigation Phase 03 - Expo Mobile Client

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

- **Angular application context navigation cross-platform master review:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-review.md` sections 3, 4, 6, 7
- **Angular application context navigation Expo implementation profile:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-module-context-navigation-master | 3 | `b360497f8f7a980a9b2e158a0a14f5452ed6bdbf7c98891fa791064460ae6390` |
| angular-module-context-navigation-master | 4 | `c1324c1cfb273d7ea9912b07e2c2e2eb5826afac16b1e3439e4c10d30ed5a0a0` |
| angular-module-context-navigation-master | 6 | `8ec030f4e1c72aa5c699512260c1c57d68ebd7688d2b02e3013500dd8f961336` |
| angular-module-context-navigation-master | 7 | `121cd35d3780b240c74f440e3f368fc2c3e388ea0b602cfe9595e04f66aa23ea` |
| angular-module-context-navigation-mobile | 1 | `c55738e67daf516bad24d330b5eaa48d89aa771aa0c5c9367dde7a00cf1a6302` |
| angular-module-context-navigation-mobile | 2 | `cd0441cf47d901383bbcd3f66cd55e25b22eca84f14b433a4c4e5a4136a775b5` |
| angular-module-context-navigation-mobile | 3 | `b360497f8f7a980a9b2e158a0a14f5452ed6bdbf7c98891fa791064460ae6390` |
| angular-module-context-navigation-mobile | 4 | `c1324c1cfb273d7ea9912b07e2c2e2eb5826afac16b1e3439e4c10d30ed5a0a0` |
| angular-module-context-navigation-mobile | 5 | `ad37f9208578207bb142bb810412eea23caf874669fcc873c8cfd31d088c353d` |
| angular-module-context-navigation-mobile | 6 | `8ec030f4e1c72aa5c699512260c1c57d68ebd7688d2b02e3013500dd8f961336` |
| angular-module-context-navigation-mobile | 7 | `121cd35d3780b240c74f440e3f368fc2c3e388ea0b602cfe9595e04f66aa23ea` |
| angular-module-context-navigation-mobile | 8 | `8fe455f912589c8225049720348791a1b3f36a0bbb64fd18640fe27e425f1726` |
| angular-module-context-navigation-mobile | 9 | `5c8b535c12fcf226da0d043061e2fe30da081036abe32c27e1862428f2f872a9` |
| angular-module-context-navigation-mobile | 10 | `dddfcf4db65993beab3a319f9abebb699878f3620d64ea3cab5d74456652b3e5` |
| angular-module-context-navigation-mobile | 11 | `1fbb9765392d357a650913625dc67d4591b4d163b68b5ee40e753d1d5e1b6168` |
| angular-module-context-navigation-mobile | 12 | `4b8a857346e8e30ca6d40ceb3ec49deba68787019ea091c95ba451bc002452fe` |
| angular-module-context-navigation-mobile | 13 | `056ee58455fb971a375392b39fb541869ce38b807f5b937eb3c8353ed316a30b` |
| angular-module-context-navigation-mobile | 14 | `08c29bfc093044341e820929da4c858953f2f7d374c22a80f4f21f5a6e4b24cb` |
| angular-module-context-navigation-mobile | 15 | `323b611e52e573c8ef93e22bf36d9791e49bb95dcc9470fc3678b072b0d8b13e` |
