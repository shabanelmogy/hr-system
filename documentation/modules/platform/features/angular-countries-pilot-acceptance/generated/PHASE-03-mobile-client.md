<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Countries complete Angular pilot acceptance Phase 03 - Expo Mobile Client

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

- **Countries complete Angular pilot acceptance cross-platform master review:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-review.md` sections 3, 4, 6, 7
- **Countries complete Angular pilot acceptance Expo implementation profile:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-pilot-acceptance-master | 3 | `b60535df6f9174010782baed9e03af94042513e518fbed7418618c315f46c337` |
| angular-countries-pilot-acceptance-master | 4 | `c2f924e767e6c47bb155a02081c795e3c9aa9c9353c65741237a4cc9cbd6ab42` |
| angular-countries-pilot-acceptance-master | 6 | `5fa79433edfee936f81b6259cb61c3c72bd3795b68c54b038bb614b08ca4d730` |
| angular-countries-pilot-acceptance-master | 7 | `a0871f0deb9d51fd5188b394318ddd8452ad5c770fb4b980cd4c32e02958aac9` |
| angular-countries-pilot-acceptance-mobile | 1 | `ac974c3c03e926da01e2cd4d70e2125344d33c35cf4cbbe739984e28e2cc1b51` |
| angular-countries-pilot-acceptance-mobile | 2 | `fa3d7dae26a2a2723af52b2fb6d47134773511ad0f0073db0dfda826cdca7f8b` |
| angular-countries-pilot-acceptance-mobile | 3 | `ac954dd1cd9b19b1d83184ce0ebea936b46414e62b2eb7b07ac22e4ad7780726` |
| angular-countries-pilot-acceptance-mobile | 4 | `bb9ab82f73a9ac7565ac2daeaddad094717ae99eb786c6b27292f44359d50ad0` |
| angular-countries-pilot-acceptance-mobile | 5 | `3e64fb63164c207a0b5627f3278a4ed4f74d68af2401eda5a25dca861a2736b8` |
| angular-countries-pilot-acceptance-mobile | 6 | `d6ad60186ad277536f99b7bb4bacdee722dc58efe07cee75899c31e4182fb998` |
| angular-countries-pilot-acceptance-mobile | 7 | `d30f650a3c3c8dba4866f3537c27dde5e8a4e3d7f8acd39f63c7b40fc5f56c2b` |
| angular-countries-pilot-acceptance-mobile | 8 | `f8ddab71bf7f0f9228b946ef81165a6706fe31f648247792b2b48fe80646baf7` |
| angular-countries-pilot-acceptance-mobile | 9 | `273430a31e8dfebb4892fa3eee119c3fa8fa10cdca2150eaceb66f2c4f011f09` |
| angular-countries-pilot-acceptance-mobile | 10 | `d1a06262f8795fb1ee2a0572659d4da0f78a671c275fd7e0da2e52b9faba600f` |
| angular-countries-pilot-acceptance-mobile | 11 | `6282d9e0aadf0205a7879543ba007e253c4fc0580578ea83e1ccfc29af98b94c` |
| angular-countries-pilot-acceptance-mobile | 12 | `49e888ac56d99f7874e3f4b067ed086c71f4c289959b89f9c58d70ba536bedb8` |
| angular-countries-pilot-acceptance-mobile | 13 | `5fb6c9ffcece56f7dda5336c016c5f1c21f295cac6525a8c88bf5964520506c6` |
| angular-countries-pilot-acceptance-mobile | 14 | `dc05defa17ba25d72477b2ca71aa85ff3c51323a8992c47aad376452d0053750` |
| angular-countries-pilot-acceptance-mobile | 15 | `8da7404d2323ae2e158b4f744ce85ada57c5fed0ed0eeaf6b5446ea4c4d841f1` |
