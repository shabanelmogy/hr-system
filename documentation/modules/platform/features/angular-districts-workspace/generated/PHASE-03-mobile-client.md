<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Districts complete Angular parity Phase 03 - Expo Mobile Client

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

- **Districts complete Angular parity cross-platform master review:** `../modules/platform/features/angular-districts-workspace/angular-districts-workspace-review.md` sections 3, 4, 6, 7
- **Districts complete Angular parity Expo implementation profile:** `../modules/platform/features/angular-districts-workspace/angular-districts-workspace-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-districts-workspace-master | 3 | `2699da4d9c97c7c9e5bd04fcbeb2de97371c4fb14deb0b861e5daf1c09d3ff43` |
| angular-districts-workspace-master | 4 | `f28c9ed08d649377a2113ffb8d720da7b09fcb9f16238158dd1fbb12e4ff174e` |
| angular-districts-workspace-master | 6 | `2d7594d538e94b03e4b496a02d2755f2a96745a20d527229c8d1c3c48ce829b8` |
| angular-districts-workspace-master | 7 | `054cae3882dac8d5d142ce6057c742535ca9f3c8d375ec5621ae1c5fb6efc855` |
| angular-districts-workspace-mobile | 1 | `5176ad728f2b766909a09a9cee5adea81c633bb270bcd26279a4b4a9754fcadc` |
| angular-districts-workspace-mobile | 2 | `7d3cdde508cc1fd64be7f337a3a3f1f9ad27e94ebbfe12465578ca7df367d84c` |
| angular-districts-workspace-mobile | 3 | `2699da4d9c97c7c9e5bd04fcbeb2de97371c4fb14deb0b861e5daf1c09d3ff43` |
| angular-districts-workspace-mobile | 4 | `f28c9ed08d649377a2113ffb8d720da7b09fcb9f16238158dd1fbb12e4ff174e` |
| angular-districts-workspace-mobile | 5 | `83ee8d058bd1852919a3b4e1e552e737c4d8dccf327cd57d07603025aefb2735` |
| angular-districts-workspace-mobile | 6 | `2d7594d538e94b03e4b496a02d2755f2a96745a20d527229c8d1c3c48ce829b8` |
| angular-districts-workspace-mobile | 7 | `89f31137fe07f6a636a472ad76c9d93d20998759f0b819514504fbd798c88f82` |
| angular-districts-workspace-mobile | 8 | `6b0affc4f5a9229dcc500e114b0b37d60b52eb819ec6219986706b3957ba65fb` |
| angular-districts-workspace-mobile | 9 | `db4b325ac4030e9da6b16e3f937c8e096cb382b7d0237821d04ba61450a5923f` |
| angular-districts-workspace-mobile | 10 | `238aaba6b3f40c39dc608844d96971c0a35368f7cc1da44450383e2fadd8b0ba` |
| angular-districts-workspace-mobile | 11 | `61b0f90a550f98e596889d1ca889cdd0884d8b101d9d1a467eac82f7e358f7f7` |
| angular-districts-workspace-mobile | 12 | `4e82a4b1fadb9cbe32c1a20f1c2f8928e6d5862e62e693d862aff3ac8d215234` |
| angular-districts-workspace-mobile | 13 | `3a83a7e85c9fb6480acffddc41e7d131bf60e191698e901ba53e2311999d0e68` |
| angular-districts-workspace-mobile | 14 | `6a476e0065abe39a88ff42c5d854d9bb96f4fce3e0bda6325221c6801001a576` |
| angular-districts-workspace-mobile | 15 | `418f1e8e5d2c6eb6de865f9043da23515ea3884d566bc8212780c4e764271ee6` |
