<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Shared all-filtered Excel and CSV export Phase 03 - Expo Mobile Client

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

- **Shared all-filtered Excel and CSV export cross-platform master review:** `../modules/platform/features/angular-collection-export/angular-collection-export-review.md` sections 3, 4, 6, 7
- **Shared all-filtered Excel and CSV export Expo implementation profile:** `../modules/platform/features/angular-collection-export/angular-collection-export-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-collection-export-master | 3 | `445de2c62628a394c0c4ec636f2ab80c9d6bf0fdfa161141d186a179838d80fa` |
| angular-collection-export-master | 4 | `11ab4fd40aa5c27d030d22f24d84c6ba4aa8773f59f94187bbfe01cad619991c` |
| angular-collection-export-master | 6 | `a261439a7e54afa223514c4b4c8a291ad970e428010bdf50cccb9644f45a9743` |
| angular-collection-export-master | 7 | `22a4d8edb5b7c12c4ef24386083a68460c545b2812f26a0b4b84929c92765310` |
| angular-collection-export-mobile | 1 | `c2ae1e2e446357c72bca84b940abd1b4a0c72d7492c8c1a325709eaf3474df2f` |
| angular-collection-export-mobile | 2 | `3d4d1cccf9731878c83a180ea9cf3da19bc60b22638d9ca80429936b688d972c` |
| angular-collection-export-mobile | 3 | `445de2c62628a394c0c4ec636f2ab80c9d6bf0fdfa161141d186a179838d80fa` |
| angular-collection-export-mobile | 4 | `11ab4fd40aa5c27d030d22f24d84c6ba4aa8773f59f94187bbfe01cad619991c` |
| angular-collection-export-mobile | 5 | `2848d51a90cc824caaf3a08b86ab5b84e0fcb9f3ff0e57d8c8564e57c052fcb7` |
| angular-collection-export-mobile | 6 | `a261439a7e54afa223514c4b4c8a291ad970e428010bdf50cccb9644f45a9743` |
| angular-collection-export-mobile | 7 | `22a4d8edb5b7c12c4ef24386083a68460c545b2812f26a0b4b84929c92765310` |
| angular-collection-export-mobile | 8 | `2bd7cae6c908f53e4d96af362446cc66c27886f0a5c931fff2193898b3c39b30` |
| angular-collection-export-mobile | 9 | `0314d42449a9d815704ec1cae9e1b9a83cdc2fd19c9822997852028d23c15113` |
| angular-collection-export-mobile | 10 | `d1edf745c381758e648f1843d464426c2fdbb943b90ae1d70f8e0c2e7583ac2d` |
| angular-collection-export-mobile | 11 | `be1f78514e46607c9b87c07d2f3512c055e814008c906d57690f5c96bbc11a4a` |
| angular-collection-export-mobile | 12 | `ba0b2122f3a968f88a94c47f3a7c139acec2450c3fff68b282c846bf5e4e9201` |
| angular-collection-export-mobile | 13 | `55b050a45687faf98ffdae6c1e861adedf4af7806a6984385063f1574191dd04` |
| angular-collection-export-mobile | 14 | `ceb7eed7e891ef5e995670ebd004160eaf1bdb2f13844b26e9409dfdeda6d173` |
| angular-collection-export-mobile | 15 | `c6f23a863122898d678aee894212a77e203a6b299b7e7d345794c47d1265cfc6` |
