<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Company Geographic Scope Phase 03 - Expo Mobile Client

## Purpose

Implement the Expo client as a native presentation of the shared contract, using the same server-list and lifecycle semantics as web.

Execution reference: `documentation/mobile-react/MOBILE_FEATURE_GUIDE.md`.

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

- **Company Geographic Scope cross-platform master review:** `../project/COMPANY_GEOGRAPHIC_SCOPE_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Company Geographic Scope Expo implementation profile:** `../mobile-react/company-geographic-scope-mobile-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-geographic-scope-master | 3 | `1eddc721d6657a5c21b9d719373cc2c21b1cd4c4e5da06db8520db87a76d2c77` |
| company-geographic-scope-master | 4 | `8a793aa6af268801e0554b7339d3c2a20a793da042b2ada9e9688180a6e1331b` |
| company-geographic-scope-master | 6 | `92d260cdc23463e140aee8d219007e899e8cae69c926cc42eefd62f198ac4f06` |
| company-geographic-scope-master | 7 | `ac1df7984c1421dcc4decfb548cab2e1c25325bb3d8dfb0be5d5f83b305a926e` |
| company-geographic-scope-mobile | 1 | `532e6ed7fba6950c2431df4618517a4229c3db80d66f559269921cfc4f4fb5b7` |
| company-geographic-scope-mobile | 2 | `222d3b572966f880d40e8ea982501f8b960119079307433882f971ce26f876da` |
| company-geographic-scope-mobile | 3 | `f65b57e742e8a961a79b1ccfdeced953dbd6d3b9da0fcca8184c3e1ca15fd3b1` |
| company-geographic-scope-mobile | 4 | `c9eb7963c0aef8499e7451bca7cbf69bcc29465dab82d325dee45b648bd8e256` |
| company-geographic-scope-mobile | 5 | `144fa3faa70ae0effff52f25b3c88a35eb29984cbbd6ffef79ac7a52fdab923c` |
| company-geographic-scope-mobile | 6 | `7be840afcb22be7ba0823e9d2858bd9ff7f3cb641d148ffcdfc39c1447313b1d` |
| company-geographic-scope-mobile | 7 | `e411461b01ccc5a368e334f1b1ea113836580ce1cadd1616ff849d7d9a74b513` |
| company-geographic-scope-mobile | 8 | `6d1f5c90598a716607273271bb0a2ae2f880deef5d9f068d812060d22b9dee29` |
| company-geographic-scope-mobile | 9 | `19987636dcb8207d611b556d35c73b73354b7911b848189ed3b4b9ac7459059d` |
| company-geographic-scope-mobile | 10 | `f375fdb887b65c19f6c2b8338a7758f5b820cda56bfd0f5918f5bd87816f50ba` |
| company-geographic-scope-mobile | 11 | `e662955d031606b0591f09c9827e45ea328b5c45f28faec7fe1ad21798cc83b9` |
| company-geographic-scope-mobile | 12 | `f7a65285cebf5482db8f642d637989138809b28c716cb015abee09b9779643ce` |
| company-geographic-scope-mobile | 13 | `727de5705147b03fa31f1a52b785b264a4cb61cd547124f0be51b2ea3458833e` |
| company-geographic-scope-mobile | 14 | `86c21a217f70553f80bf776d8079f1a71e47bd8b3e897ae0622393c7c217b679` |
| company-geographic-scope-mobile | 15 | `b767fcba0ad7fe9bdf7849932dfda0e6a11627f7a25b97ba2b11c6b1efa23718` |
