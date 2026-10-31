<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Shared unsaved navigation and context protection preparation Phase 03 - Expo Mobile Client

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

- **Shared unsaved navigation and context protection preparation cross-platform master review:** `../modules/platform/features/angular-unsaved-navigation-foundation/angular-unsaved-navigation-foundation-review.md` sections 3, 4, 6, 7
- **Shared unsaved navigation and context protection preparation Expo implementation profile:** `../modules/platform/features/angular-unsaved-navigation-foundation/angular-unsaved-navigation-foundation-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-unsaved-navigation-foundation-master | 3 | `759da36881cb7dd27e8bc716118ea565e36dfa9ecd48e0e00d42db465a8f02b0` |
| angular-unsaved-navigation-foundation-master | 4 | `2d58c0161cfcb36c86ca393a6a5ec8f098ada807d4d0e96804bafc8983adfa3a` |
| angular-unsaved-navigation-foundation-master | 6 | `fd1302a727902105771ff702edcef4fed293c85eb54daa95d9d57f3caf84fa3c` |
| angular-unsaved-navigation-foundation-master | 7 | `df7297b5bc050edb057a770df55d5088be19599dcc6bae960a2f0dd11e02e09c` |
| angular-unsaved-navigation-foundation-mobile | 1 | `7c5159891c1b522f39583996cc03b89d729ab2601de7c28da4cd09a58db4decb` |
| angular-unsaved-navigation-foundation-mobile | 2 | `79e5a97f176aa796f1eafec856bbc2fef44fe4e15909fc9e9a4af11a081d9bdd` |
| angular-unsaved-navigation-foundation-mobile | 3 | `759da36881cb7dd27e8bc716118ea565e36dfa9ecd48e0e00d42db465a8f02b0` |
| angular-unsaved-navigation-foundation-mobile | 4 | `2d58c0161cfcb36c86ca393a6a5ec8f098ada807d4d0e96804bafc8983adfa3a` |
| angular-unsaved-navigation-foundation-mobile | 5 | `a0d875b6c17ba506eff2ec67858ddf6be03398c262c294ffb637a058e753f9b9` |
| angular-unsaved-navigation-foundation-mobile | 6 | `fd1302a727902105771ff702edcef4fed293c85eb54daa95d9d57f3caf84fa3c` |
| angular-unsaved-navigation-foundation-mobile | 7 | `df7297b5bc050edb057a770df55d5088be19599dcc6bae960a2f0dd11e02e09c` |
| angular-unsaved-navigation-foundation-mobile | 8 | `102e05d9052cbe150f9838d835dcf3236fb078cddb9870e1026195410c01f87e` |
| angular-unsaved-navigation-foundation-mobile | 9 | `3a1057f037bc3b51ed5b9a18e3318ae5af9cc03b192c60d47ef3a5b817d786aa` |
| angular-unsaved-navigation-foundation-mobile | 10 | `0b1dd9dc51445c019adb6e53cf01354dd7c27ad536b2fb307472c04731833c0e` |
| angular-unsaved-navigation-foundation-mobile | 11 | `a14108c59792851a8cf0b396c902cc0a064767ad61a7804cdf0b8376b3d983c6` |
| angular-unsaved-navigation-foundation-mobile | 12 | `e8cb9f856bb8cd95cf5c75447012220d34af46d584c29d89ff9e3a5a11a40308` |
| angular-unsaved-navigation-foundation-mobile | 13 | `8ee5f72106aec53e2875658413ddfe630ec0c6e0d8a37b120ee2a37ae855a47f` |
| angular-unsaved-navigation-foundation-mobile | 14 | `b32771bea01c613dd5d8b0595a903084951c2146a7146887cd42ce88a7d72107` |
| angular-unsaved-navigation-foundation-mobile | 15 | `6554f82533c72d75042157b056e43d7f2961f64ac7446de21fb78f79bf50a49d` |
