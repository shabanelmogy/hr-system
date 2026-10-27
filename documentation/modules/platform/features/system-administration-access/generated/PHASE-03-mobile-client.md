<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Global administration access Phase 03 - Expo Mobile Client

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

- **Global administration access cross-platform master review:** `../modules/platform/features/system-administration-access/system-administration-access-review.md` sections 3, 4, 6, 7
- **Global administration access Expo implementation profile:** `../modules/platform/features/system-administration-access/system-administration-access-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| system-administration-access-master | 3 | `704e3c85fd755ce72131685e56fc46c41a32cbf2b8388b819b2908141a920c97` |
| system-administration-access-master | 4 | `a69c6b83cf4513c9051189de306206a99c36ab894ff3c699157a3f4d5b274268` |
| system-administration-access-master | 6 | `2629b587e5bb1b3857c3082d606a2495a68b8cd1b6519071abe158531322532e` |
| system-administration-access-master | 7 | `58cc6420bb8c825b4e6edca064742a11a6e5130811be4f92456d8f95a12d4762` |
| system-administration-access-mobile | 1 | `672540d4adc62d3622a80f58d49e28f8d653ecadb376da59727566b2270e8358` |
| system-administration-access-mobile | 2 | `ad63af066c8d004e6c8bb5e73e66f44a8801d95b7577321e5b9f4da9b8b9320a` |
| system-administration-access-mobile | 3 | `704e3c85fd755ce72131685e56fc46c41a32cbf2b8388b819b2908141a920c97` |
| system-administration-access-mobile | 4 | `a69c6b83cf4513c9051189de306206a99c36ab894ff3c699157a3f4d5b274268` |
| system-administration-access-mobile | 5 | `bb1cd5d2d45a16f4e668fca2e890241a7bd57100a49f0f91df1fee7f32648be8` |
| system-administration-access-mobile | 6 | `2629b587e5bb1b3857c3082d606a2495a68b8cd1b6519071abe158531322532e` |
| system-administration-access-mobile | 7 | `58cc6420bb8c825b4e6edca064742a11a6e5130811be4f92456d8f95a12d4762` |
| system-administration-access-mobile | 8 | `309d8d180ca02d2c3eb921de0e2f0f45b42e1431f27a5fc8df80dae139cfa537` |
| system-administration-access-mobile | 9 | `ae2f25e0e91b95de952ee9b9e026c0ce3a0ed25ffcfb577a03bdc77728ce85ff` |
| system-administration-access-mobile | 10 | `ebba736b456d2363c58da24a7d2cac79e48605c0f8ea29780d2f3c40f26c98a0` |
| system-administration-access-mobile | 11 | `27b43263e6a89be6211323dd828db1627d4e4b13981c9f76424aefb3e5d49a69` |
| system-administration-access-mobile | 12 | `c600d8df7d364e5b7d61ca358cf0cef1c7f4bbe58855120ac57189e131cda717` |
| system-administration-access-mobile | 13 | `bae17b25e79f16860f2e16ff91d0820faf9bc295439f430aa2a491853c65ac8f` |
| system-administration-access-mobile | 14 | `24a04d4f722b63dc7741b03accd41c6bb44ba4f03b4c9ebe11999a22b630c7c6` |
| system-administration-access-mobile | 15 | `f233b4fde169c8c74f50ccd6753ab6cfd93bb3ac99c555f809954dac2e86403c` |
