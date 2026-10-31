<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Shared collection criteria URL preparation Phase 03 - Expo Mobile Client

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

- **Shared collection criteria URL preparation cross-platform master review:** `../modules/platform/features/angular-collection-criteria-foundation/angular-collection-criteria-foundation-review.md` sections 3, 4, 6, 7
- **Shared collection criteria URL preparation Expo implementation profile:** `../modules/platform/features/angular-collection-criteria-foundation/angular-collection-criteria-foundation-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-collection-criteria-foundation-master | 3 | `e120bae9424f50678f0c7cc941f0d8149350391eaf09474ccbc5092ac324120a` |
| angular-collection-criteria-foundation-master | 4 | `bcf2c705898c5e13f7a4b5bc6b350f2ee08fff544ba58a8525ccec6b36720864` |
| angular-collection-criteria-foundation-master | 6 | `0b2ae962f994a597a781fc41c0f929c39c5fde0d2719e1e7a5044162464bd027` |
| angular-collection-criteria-foundation-master | 7 | `1d85249d77efc9832fc5f094b4a3dd8b26add9e8fb63d4f71adb9f121d9cb791` |
| angular-collection-criteria-foundation-mobile | 1 | `533d7d7e5bbece37a3fe439f8356343c5c6e32149acd09efae03b70390162f1e` |
| angular-collection-criteria-foundation-mobile | 2 | `fde38cd94f53af728f6c35253ef0a93a7b82029b204a20b593656b5d297a083c` |
| angular-collection-criteria-foundation-mobile | 3 | `e120bae9424f50678f0c7cc941f0d8149350391eaf09474ccbc5092ac324120a` |
| angular-collection-criteria-foundation-mobile | 4 | `bcf2c705898c5e13f7a4b5bc6b350f2ee08fff544ba58a8525ccec6b36720864` |
| angular-collection-criteria-foundation-mobile | 5 | `b26b87322048e11590e55342af5142b1a15eb66624a7a0565a0e13c1d67303bc` |
| angular-collection-criteria-foundation-mobile | 6 | `0b2ae962f994a597a781fc41c0f929c39c5fde0d2719e1e7a5044162464bd027` |
| angular-collection-criteria-foundation-mobile | 7 | `1d85249d77efc9832fc5f094b4a3dd8b26add9e8fb63d4f71adb9f121d9cb791` |
| angular-collection-criteria-foundation-mobile | 8 | `edb03e0306a5c1288467e8473feb2d2ac2a124ea340b41fd06c98df22d02bd9c` |
| angular-collection-criteria-foundation-mobile | 9 | `f5dee5a7372a530fad3f09162a7ff49f3dce3d00ab98770778cd64a826e95939` |
| angular-collection-criteria-foundation-mobile | 10 | `02ba8586978267daf88bbdae9c6f80c10475256d6e6d22678381eb3524460df7` |
| angular-collection-criteria-foundation-mobile | 11 | `502b954c32abefbd0082fee8267e052b96b704dbfcaae228c6df849fae440112` |
| angular-collection-criteria-foundation-mobile | 12 | `91845ae82173d358932b92bf87a56347c6e13d44c7555b63beca22641118b9e3` |
| angular-collection-criteria-foundation-mobile | 13 | `f1529e78e2a45214b981027e6a6a8fdea12baff581eccb382d8c3271aeb232bb` |
| angular-collection-criteria-foundation-mobile | 14 | `2143f51546d22aeb0dd09d32f52e3d73640137962e5102ee9b7b8c643cc5497a` |
| angular-collection-criteria-foundation-mobile | 15 | `2037541feac6c347eb95739d4155a9ac1b00451f8d51a2659dfef1abed0c63d5` |
