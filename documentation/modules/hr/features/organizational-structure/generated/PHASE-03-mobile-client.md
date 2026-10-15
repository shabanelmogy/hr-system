<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Organizational Structure Phase 03 - Expo Mobile Client

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

- **Organizational Structure cross-platform master review:** `../modules/hr/features/organizational-structure/organizational-structure-review.md` sections 3, 4, 6, 7
- **Organizational Structure Expo implementation profile:** `../modules/hr/features/organizational-structure/organizational-structure-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| organizational-structure-master | 3 | `57ab452f6cc671bd93de8808d8d1766d507cf902b6269bdb0e07c8422f87249a` |
| organizational-structure-master | 4 | `834005c26053eb5eee6e85e186c98953501eda8584fb9e30055ec9bd16391cb8` |
| organizational-structure-master | 6 | `a316d1bb04bf7dca2b1ec941cb7168ae1643a93d386676d4ce4677e08fb9875b` |
| organizational-structure-master | 7 | `0aec4883eaa2766ef0c3d4522286a307cff869fdad881fd36605e4bee72ee197` |
| organizational-structure-mobile | 1 | `c215c8134325e88449cdf71f3aef307e39768d74f52de24ad7e3080be347d8e9` |
| organizational-structure-mobile | 2 | `6a6a29cf409d57eb361c3ff9dde4e2ced13fef399c23202326467a293cb0f5e4` |
| organizational-structure-mobile | 3 | `431d2d769e93c57be49557148504f109a9b97385604e86800de3ba8a08f77f34` |
| organizational-structure-mobile | 4 | `8cc75dbebfb4ad8202ab17f0dd541afdb9a4e06f9e524b3ea4520d44ded456c9` |
| organizational-structure-mobile | 5 | `4f959e764f926fb47e3b3111d68b438ee6035fdef8b002b23a8723c4137ef0d8` |
| organizational-structure-mobile | 6 | `52412b9551e5b7c9099bbfbfca64399776e011da81f4b41527e7ef9f8bfcaa81` |
| organizational-structure-mobile | 7 | `31d90cc7d12e98d4a93f5be941c1c54a7e1d76e586313a599fec3f88e932c873` |
| organizational-structure-mobile | 8 | `01d7e4e9f2639e09de0df38fc90e7ab03b0f28a0c67f5b28a9a9c3981b5f94e1` |
| organizational-structure-mobile | 9 | `a81ab1f68c57c31f0a4a4e83b9a035b17676c9c8098b2ab3ce74e33b1323c466` |
| organizational-structure-mobile | 10 | `a63acd8c39188f4d933e677680fde79c2170aa45afe71c8cf4b896109c5bc06c` |
| organizational-structure-mobile | 11 | `df3c9d0ed6eda9a04b4c65c683e7dd621a9e354ae7d8fdb31a5d79a9a4d0929d` |
| organizational-structure-mobile | 12 | `a8731c681436d699f98b56159978ab43b87dec90325e32bd0d384599339f2d4b` |
| organizational-structure-mobile | 13 | `5fd7d3bd98db2bf4f94f0dccb7a4f57437598e87eca78a4da4f5d6ebc9656b2a` |
| organizational-structure-mobile | 14 | `9672c4be9c2cd20ed33af557b00e7d31e003665de258a4a25827e8ed91e79ee0` |
| organizational-structure-mobile | 15 | `85d324cd065dd2048f40a320715e506ab78f314b3db5d3481f67954747d86195` |
