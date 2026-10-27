<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Authorized global UI texts Phase 03 - Expo Mobile Client

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

- **Authorized global UI texts cross-platform master review:** `../modules/platform/features/system-ui-localization/system-ui-localization-review.md` sections 3, 4, 6, 7
- **Authorized global UI texts Expo implementation profile:** `../modules/platform/features/system-ui-localization/system-ui-localization-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| system-ui-localization-master | 3 | `1ee7d4e8885245528fdf4f6bec8d6924401c91d12afe634f6e608126037ffcb7` |
| system-ui-localization-master | 4 | `70e996ad943b48a5390a7c4448bec7db1c3245527c19f1bd2e3b4f9ae8f265aa` |
| system-ui-localization-master | 6 | `3bbcb625fb4c308266540a9c24a749a31aaff91d5e1d10ba69d1773f6abcc50a` |
| system-ui-localization-master | 7 | `a8ab3f527bc433b0074537902f6277738ca193373b87064641cebcd110862d9a` |
| system-ui-localization-mobile | 1 | `f0c24d8ee1a9949554fca7f69b08285d5cc185ba19f5135c357b8a158567fda7` |
| system-ui-localization-mobile | 2 | `f0aa58d0765dfab25b550c01883af501545168b881c3d017a8b415053ef17aac` |
| system-ui-localization-mobile | 3 | `27fd78b4221daaa90f2a4afd180a6d8a86bc2bfacde82ac8a5ed5129969a60bc` |
| system-ui-localization-mobile | 4 | `70e996ad943b48a5390a7c4448bec7db1c3245527c19f1bd2e3b4f9ae8f265aa` |
| system-ui-localization-mobile | 5 | `32146820e095b75cf0b9b59dea51a78e31dd718a67a0d9e531bb570544f3cf2b` |
| system-ui-localization-mobile | 6 | `3bbcb625fb4c308266540a9c24a749a31aaff91d5e1d10ba69d1773f6abcc50a` |
| system-ui-localization-mobile | 7 | `a8ab3f527bc433b0074537902f6277738ca193373b87064641cebcd110862d9a` |
| system-ui-localization-mobile | 8 | `ab04613f8900e50c021f17ece5784bbd9ff2c8ec0a5ab19e1fa0707c1e8a7437` |
| system-ui-localization-mobile | 9 | `b2bb6b54de02f61156ea76e042b7ec1efd6dff331c3a384ecfe59732d9aa0ae9` |
| system-ui-localization-mobile | 10 | `70d00273093757d7ab7466ed0d5ae7e30edafed482e6361c972641ff640741f0` |
| system-ui-localization-mobile | 11 | `7071778ae3aeee3acdf7c4f79c16425f5f3a9b502205a302b7fbc6ba254c3793` |
| system-ui-localization-mobile | 12 | `55a2b31011a77828dcd674c5deb579d8d372c8c4da49a5a3d67a9400bf8227a2` |
| system-ui-localization-mobile | 13 | `9a80e3d967c027ccc2b484ecfc7447575a1533c2df7a8d01c4e912f2381222c7` |
| system-ui-localization-mobile | 14 | `64ab1ea88b19827ff4289af8ce9ccbc423435a81e884bdcb63fb0b5876d2f7e7` |
| system-ui-localization-mobile | 15 | `349697f373b56dfa6ff1bb4201558e4703a9fc5136a98e343c9e960a593f7140` |
