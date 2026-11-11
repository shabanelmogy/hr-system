<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# System log collection consistency Phase 03 - Expo Mobile Client

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

- **System log collection consistency cross-platform master review:** `../modules/platform/features/angular-system-log-collection-consistency/angular-system-log-collection-consistency-review.md` sections 3, 4, 6, 7
- **System log collection consistency Expo implementation profile:** `../modules/platform/features/angular-system-log-collection-consistency/angular-system-log-collection-consistency-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-log-collection-consistency-master | 3 | `12f111595614ea950811c077c53358a01b7ab5260509170b9288d2466e8fed93` |
| angular-system-log-collection-consistency-master | 4 | `48c9478184f5033a48097e62acc5a2b2bd1e174bb765f79f6cc76529c724ed2f` |
| angular-system-log-collection-consistency-master | 6 | `191b49556278f89e498ed723a4a08d42cc1013ffb4e628050059a6700b74d79d` |
| angular-system-log-collection-consistency-master | 7 | `260ff8388a7a43e7e9e6e645ce76762eadc8407569b146300d93b6bd9ed6ec89` |
| angular-system-log-collection-consistency-mobile | 1 | `b06ba8cb0ce9db0b852396774e0a816050c4aea473bb32ce287bc4011a0187fa` |
| angular-system-log-collection-consistency-mobile | 2 | `f0823b6af2c0f834ce156a0bee907ae7335e7b4ef055c845b067ac0c327cabc5` |
| angular-system-log-collection-consistency-mobile | 3 | `12f111595614ea950811c077c53358a01b7ab5260509170b9288d2466e8fed93` |
| angular-system-log-collection-consistency-mobile | 4 | `48c9478184f5033a48097e62acc5a2b2bd1e174bb765f79f6cc76529c724ed2f` |
| angular-system-log-collection-consistency-mobile | 5 | `6023544e13d3ee21aab652cc92b31a9a24e6cba2d3c63b2d19d8ec031acc0dfc` |
| angular-system-log-collection-consistency-mobile | 6 | `191b49556278f89e498ed723a4a08d42cc1013ffb4e628050059a6700b74d79d` |
| angular-system-log-collection-consistency-mobile | 7 | `260ff8388a7a43e7e9e6e645ce76762eadc8407569b146300d93b6bd9ed6ec89` |
| angular-system-log-collection-consistency-mobile | 8 | `93e012929f86efae1c41d1bb5229dc18332bb0ba8c1edd71eacd06812fbb5a5d` |
| angular-system-log-collection-consistency-mobile | 9 | `8211a083005f754d21dfa0bd936831bb555e61db53028af36cbc795838d56f79` |
| angular-system-log-collection-consistency-mobile | 10 | `f58efe9c771befa7aaf5130a56df6fce26a6cea8aa27f40edb6c4155c0b63b54` |
| angular-system-log-collection-consistency-mobile | 11 | `613af3d9d0b6f6423157ad14b5562c697d985c7fbbd14178956312e386c51898` |
| angular-system-log-collection-consistency-mobile | 12 | `a86a597260fd56170b6a943f63b37be006e5ad02fa532382cbda79c78e599ec2` |
| angular-system-log-collection-consistency-mobile | 13 | `42d3611e86b09eb7fc0975ef038314c3fdf6be16d5e850c28f690cd2f05f4565` |
| angular-system-log-collection-consistency-mobile | 14 | `503aebc6934e3972a1fd0b836eaed32d2e63dbab928288e0259882ac99a683b0` |
| angular-system-log-collection-consistency-mobile | 15 | `85a964d6bc4d30fd905890e102a7c74aa6c4fffac44a74ee23fbdfde298d5603` |
