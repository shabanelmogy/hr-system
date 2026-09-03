<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Organizational Structure Phase 03 - Expo Mobile Client

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

- **Organizational Structure cross-platform master review:** `../project/ORGANIZATIONAL_STRUCTURE_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Organizational Structure Expo implementation profile:** `../mobile-react/organizational-structure-mobile-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| organizational-structure-master | 3 | `e45c90794d15330609e089c888b6a6af9df12bcf5a265e1f78d93e31f39b8a8c` |
| organizational-structure-master | 4 | `0beaf7376a09bb7c622523a47042700f05bf8105485ff4f3fda6be4ed287136a` |
| organizational-structure-master | 6 | `2fdee62992580c5d76fc63348edf52701b1e514b1c18ff8be30c53dda4d1b0bf` |
| organizational-structure-master | 7 | `d3371766bde33eeaa333e5abee156d13b95e6c35dae25ecc9ca097037434c07c` |
| organizational-structure-mobile | 1 | `c215c8134325e88449cdf71f3aef307e39768d74f52de24ad7e3080be347d8e9` |
| organizational-structure-mobile | 2 | `47cebdf0a98ae323696ee1964ea27494638b937c1860d250e2baef9f4cb8d8f0` |
| organizational-structure-mobile | 3 | `431d2d769e93c57be49557148504f109a9b97385604e86800de3ba8a08f77f34` |
| organizational-structure-mobile | 4 | `8cc75dbebfb4ad8202ab17f0dd541afdb9a4e06f9e524b3ea4520d44ded456c9` |
| organizational-structure-mobile | 5 | `4f959e764f926fb47e3b3111d68b438ee6035fdef8b002b23a8723c4137ef0d8` |
| organizational-structure-mobile | 6 | `52412b9551e5b7c9099bbfbfca64399776e011da81f4b41527e7ef9f8bfcaa81` |
| organizational-structure-mobile | 7 | `65bda9a45aa8f57593f6a597fdb9972472542e3afe7bd3342ecfa808e684d782` |
| organizational-structure-mobile | 8 | `01d7e4e9f2639e09de0df38fc90e7ab03b0f28a0c67f5b28a9a9c3981b5f94e1` |
| organizational-structure-mobile | 9 | `a81ab1f68c57c31f0a4a4e83b9a035b17676c9c8098b2ab3ce74e33b1323c466` |
| organizational-structure-mobile | 10 | `a63acd8c39188f4d933e677680fde79c2170aa45afe71c8cf4b896109c5bc06c` |
| organizational-structure-mobile | 11 | `ec3e51c2ef99a1494eb03474652b596423e1d5fcc07a4ad7cf8066b0517e1b4e` |
| organizational-structure-mobile | 12 | `a8731c681436d699f98b56159978ab43b87dec90325e32bd0d384599339f2d4b` |
| organizational-structure-mobile | 13 | `5fd7d3bd98db2bf4f94f0dccb7a4f57437598e87eca78a4da4f5d6ebc9656b2a` |
| organizational-structure-mobile | 14 | `9672c4be9c2cd20ed33af557b00e7d31e003665de258a4a25827e8ed91e79ee0` |
| organizational-structure-mobile | 15 | `85d324cd065dd2048f40a320715e506ab78f314b3db5d3481f67954747d86195` |
