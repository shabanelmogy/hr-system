<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Foundation exit and pilot readiness assessment Phase 03 - Expo Mobile Client

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

- **Foundation exit and pilot readiness assessment cross-platform master review:** `../modules/platform/features/angular-foundation-exit-assessment/angular-foundation-exit-assessment-review.md` sections 3, 4, 6, 7
- **Foundation exit and pilot readiness assessment Expo implementation profile:** `../modules/platform/features/angular-foundation-exit-assessment/angular-foundation-exit-assessment-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-foundation-exit-assessment-master | 3 | `4d3e255c72cac77b7f7bffb8b155ce832838a6c542bdc0b422902dda2c32dda4` |
| angular-foundation-exit-assessment-master | 4 | `ef1886603d2b739301c6583a472a3a32660fb656e28205f44378bd185952df7a` |
| angular-foundation-exit-assessment-master | 6 | `fbfe8ff363cfd32471333529d87cb118044ec7b76590705a0f08139b4b04006a` |
| angular-foundation-exit-assessment-master | 7 | `574b028cc3d8b969e4c433ba7f95e864d61fa8441914bc22adb2a275213a7fc0` |
| angular-foundation-exit-assessment-mobile | 1 | `4579413623709aeac863bbf783f02814bc3d1481bf1c4ddae184774a52e0507a` |
| angular-foundation-exit-assessment-mobile | 2 | `a73ce6b46bce9f34ed00180d86d88be490d97104fa2cd668ebd21e7b405af207` |
| angular-foundation-exit-assessment-mobile | 3 | `4d3e255c72cac77b7f7bffb8b155ce832838a6c542bdc0b422902dda2c32dda4` |
| angular-foundation-exit-assessment-mobile | 4 | `ef1886603d2b739301c6583a472a3a32660fb656e28205f44378bd185952df7a` |
| angular-foundation-exit-assessment-mobile | 5 | `25cc0fdd99b871c548937b062151de690f320e28a2b4cb992754e45fe5dbae61` |
| angular-foundation-exit-assessment-mobile | 6 | `fbfe8ff363cfd32471333529d87cb118044ec7b76590705a0f08139b4b04006a` |
| angular-foundation-exit-assessment-mobile | 7 | `574b028cc3d8b969e4c433ba7f95e864d61fa8441914bc22adb2a275213a7fc0` |
| angular-foundation-exit-assessment-mobile | 8 | `a68ecda2bfe01f209cbb52e0793eaeb7d6966de6a5c17412d244ec9fdfc9f3ce` |
| angular-foundation-exit-assessment-mobile | 9 | `5617cac65bbfa4d8cf8a167359903eb51c4ab7ef68f1fcfc00cb268848e0c8a4` |
| angular-foundation-exit-assessment-mobile | 10 | `dfd965d7afe5fffcff2d3df939f8447b6070c5a7bf56d76963ec3b264ede0f5f` |
| angular-foundation-exit-assessment-mobile | 11 | `a41f7ddf6804f9ac73e341369b1de373fd3da999c0fc5948788176cc586e1e87` |
| angular-foundation-exit-assessment-mobile | 12 | `4e3e136533d711dc2b1944d65a953ef4885f1b7b00a44335da47fe4e8cc5bb71` |
| angular-foundation-exit-assessment-mobile | 13 | `ad1e70fd9e3fda8329f14c174716f62e03fee38c52f04284521ce671c894995b` |
| angular-foundation-exit-assessment-mobile | 14 | `06037cd3923e8c9c270638644046f38cd4f54ffadf2f942d2c5d7bf81b217439` |
| angular-foundation-exit-assessment-mobile | 15 | `f22a993e7f41983c616e3516d2c5b0e9dbe3a677d9272e7c25722584d5b4be72` |
