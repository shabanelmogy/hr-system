<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Phase 03 - Expo Mobile Client

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

- **Countries cross-platform master review:** `../project/COUNTRIES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Countries Expo implementation profile:** `../mobile-react/countries-mobile-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| master | 3 | `3b1d97b7b5b8b6e365586be28116f39b8e3ffae0414257fca7abe5ece53fcc89` |
| master | 4 | `a9c88864fafde572fc0ffc1502f1a5ccb2fc55fdbd77aefe2c54c33d143b9529` |
| master | 6 | `b7fb453c6be690cf10f98e85664f30fb55fb590e628b0f8a0435f54cf67058ac` |
| master | 7 | `8c0ba157ab3e6ca7bfa97bd23bdd022523f69dc7ac4386e25462b7ad667ba74b` |
| mobile | 1 | `bf4af029074342fb9fc3f65bb2b6318e9d0c43f6ffd1402c2002116b569d0673` |
| mobile | 2 | `21269af699d3bfad64b852c262d640017d620ac4165fa112561ef66626153552` |
| mobile | 3 | `05c43121f9e201c08aa8356ed711924ff1a91a038db3ddf633796c8835702c87` |
| mobile | 4 | `d6ec43ef2a1441d330c3367f3283e19c2e503526c2c00f9a611ee6516f7e30bf` |
| mobile | 5 | `a8862d47b1bee84a02c6caa4838feefa79fde5a6cdee50e824d60a8b0f3b1ca1` |
| mobile | 6 | `21ec930f0a14a154b337a7688f5fcf841ce5ced6dbea9395d75ee560cdece341` |
| mobile | 7 | `8fb323178b37310b05a970bbb687982d5a4b91f49922320daa5c4287da4a2e75` |
| mobile | 8 | `330d2eef488833428f05d851f46116965190c449d6a4f0b00be9a64c11f1590b` |
| mobile | 9 | `840b2ebd06549695d85807052d10597c1f0049a6b851ed4d84c50d89a1cae5a8` |
| mobile | 10 | `7d90a6bd3148af61cc84222408c9349630432fd3c40780d755e1212ac0e76171` |
| mobile | 11 | `6713a595a06dae100c2d8f6e08528cf24699bc5a12d243524b2c02d8a5d837e3` |
| mobile | 12 | `0f0448cb6bfbd6c14def633a07bb9148564323efd7e372d4f678a2a9f8d41153` |
| mobile | 13 | `3efef9dd1e163574dca1da3052f21cb86e4229018e5ac04310660bdefa460364` |
| mobile | 14 | `72286a76f99d350c43eb2cc1645ac0aa89055b23b096e9d8af98bc4935c85430` |
| mobile | 15 | `504bef869eafe4d776837ca41e9160b58a5e45439b85cb6a79c8e340f736b967` |
