<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Angular own account profile and password parity Phase 03 - Expo Mobile Client

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

- **Angular own account profile and password parity cross-platform master review:** `../modules/platform/features/angular-account-profile/angular-account-profile-review.md` sections 3, 4, 6, 7
- **Angular own account profile and password parity Expo implementation profile:** `../modules/platform/features/angular-account-profile/angular-account-profile-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-account-profile-master | 3 | `05547cc9418b3c0fb9169c218ceafd746a6f4e0ffd41909784fddbf12c28f4d4` |
| angular-account-profile-master | 4 | `56b31df492f4c4b102eeb2517deb5b9210e0630d9e03d8fa9c9562df7349a264` |
| angular-account-profile-master | 6 | `a240983bf992c17a33cb7680bacfe0ef92dd3e2694296b1f3199cba091beca34` |
| angular-account-profile-master | 7 | `aa5ef891fd2f24c184c7aa7bf6720fd20da131dda59ae74add398dd07ea2b5bb` |
| angular-account-profile-mobile | 1 | `ad60c52bf84e3d80009d20726ae948daacb1be8fc9d0b2b7da1e691c59aeb6e3` |
| angular-account-profile-mobile | 2 | `df70c382f865d5b353a86d16db73bed7d8a622e73b1e88274fa3433ff1c91a43` |
| angular-account-profile-mobile | 3 | `1e72b066399269877a67720ac642f9b176f89f34b0b51e8d1496d46aa0a7131c` |
| angular-account-profile-mobile | 4 | `7324b6c664f8dbc4880611f72b305742c5df71e7bf0cb65555a757f3fb2e2ab7` |
| angular-account-profile-mobile | 5 | `5726115ef7f5a9a1d8524a26f1b694f0668b30a6dc37cdb802967cb6597b9b98` |
| angular-account-profile-mobile | 6 | `e7210fbf4422cb7b713932eb2f22886ae6187e91c79851fc42d57846f2117518` |
| angular-account-profile-mobile | 7 | `2ab3e65f0afe0fc8951cbcd3b610ca0dab002baec968863ae1043a506d7b50a8` |
| angular-account-profile-mobile | 8 | `f072d5a0b7147d7b4bbafac46d31161795c5d691d6f15d1752f5668b60d07ece` |
| angular-account-profile-mobile | 9 | `fdbf9b2120b5ff8155b15fbb7a33eae3494f22515517494ca6810d849b691c51` |
| angular-account-profile-mobile | 10 | `cdb49073e986a0fa1085c4c1714d5afc13fa76ff09e8cad1e68338c21bebbc9e` |
| angular-account-profile-mobile | 11 | `3a3987c56d55e9a5e1281f0241ff2eaad283e4692d917fe71dc5cc8b471231d0` |
| angular-account-profile-mobile | 12 | `e9580d57ea69639ea644cb36be792c4cc0a8bc3dc642e2c3c620453f6326728f` |
| angular-account-profile-mobile | 13 | `3c62f9d80176637932aedbb8468cf650fa2276b35ab108a3c0fcbda048152c85` |
| angular-account-profile-mobile | 14 | `eb871b8e27225fbb02a87b7705d5b2d02b78b3b319e4ec0a0e57314fbf5e62e6` |
| angular-account-profile-mobile | 15 | `03132b882cadf2168d6fc45cb37f61c9c53c20f540719ce66683b9ccf1e3758b` |
