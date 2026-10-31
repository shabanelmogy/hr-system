<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Angular Module Navigation Phase 03 - Expo Mobile Client

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

- **Angular Module Navigation cross-platform master review:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-review.md` sections 3, 4, 6, 7
- **Angular Module Navigation Expo implementation profile:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-module-navigation-master | 3 | `76f26338eb1258b3e8840ffedc2c3f3899dcf263520a65d88924c4a63a1b54dd` |
| angular-module-navigation-master | 4 | `b28a3b2785647f5b9b22349ffe73a0dc47e51a6109e6c55c040af287c7059528` |
| angular-module-navigation-master | 6 | `c7773a3a3d0320d23e28d420cb03a504db926c0a495f24ef84a2926c8d88a00a` |
| angular-module-navigation-master | 7 | `c0368a40fcdb1d0dc4a2648e49ff4afedf43fd35705dcd3e186709a51d923980` |
| angular-module-navigation-mobile | 1 | `6eeb04af3afc06c72b55828c7f764d7c0b33f24ab866cca1a75b71c2b9b360bb` |
| angular-module-navigation-mobile | 2 | `666b864631d96453655347da71a1b8b875e31e8fca1fc4333ff4bc694d7ac355` |
| angular-module-navigation-mobile | 3 | `76f26338eb1258b3e8840ffedc2c3f3899dcf263520a65d88924c4a63a1b54dd` |
| angular-module-navigation-mobile | 4 | `b28a3b2785647f5b9b22349ffe73a0dc47e51a6109e6c55c040af287c7059528` |
| angular-module-navigation-mobile | 5 | `f7b8352d8da1f0dac5d2ab4775b2fd706ef6fe6962a70ea9710449ba67d0af7d` |
| angular-module-navigation-mobile | 6 | `c7773a3a3d0320d23e28d420cb03a504db926c0a495f24ef84a2926c8d88a00a` |
| angular-module-navigation-mobile | 7 | `c0368a40fcdb1d0dc4a2648e49ff4afedf43fd35705dcd3e186709a51d923980` |
| angular-module-navigation-mobile | 8 | `a28c8e7ab96b8e263b65d6cc6f29ddcd7aa21eb204515da26481e4240515a6d9` |
| angular-module-navigation-mobile | 9 | `9950bddc28087fecd3db8304d05b405fea1c86b9944f70ed2deaf4ae597fb96d` |
| angular-module-navigation-mobile | 10 | `efe41e6f92e1f3ac374e8884cdcc69bb7a57e9e92f2a575c56b009ba123ca16f` |
| angular-module-navigation-mobile | 11 | `b4c289942920da35fc175c9081cb5d577f732a62a5ed72c8877847cdbaef54f8` |
| angular-module-navigation-mobile | 12 | `322cb4f8bacc05c7ffa8fdcd53bdbe483e44414b260b25f91f248729033fe297` |
| angular-module-navigation-mobile | 13 | `9ece4d0a3c48dc7b34f4a00ff0a152ddbb883467ee696490e4852b490d3cdffa` |
| angular-module-navigation-mobile | 14 | `fa17e0400b75d5bbbcf658b7e28fb037f01bf4988b758143b59ae0884f064283` |
| angular-module-navigation-mobile | 15 | `452488eaf324f65f31839480b064e4bd2f7e3c44ca780f6e7856e7a7ab924c0e` |
