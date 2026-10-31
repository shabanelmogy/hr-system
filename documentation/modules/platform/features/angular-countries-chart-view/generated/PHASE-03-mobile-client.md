<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Countries page-scoped charts Phase 03 - Expo Mobile Client

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

- **Countries page-scoped charts cross-platform master review:** `../modules/platform/features/angular-countries-chart-view/angular-countries-chart-view-review.md` sections 3, 4, 6, 7
- **Countries page-scoped charts Expo implementation profile:** `../modules/platform/features/angular-countries-chart-view/angular-countries-chart-view-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-chart-view-master | 3 | `b2379770bcb87b06b804edb131cd8da467ae063a3b9c1b9258cfb0e62062b5e8` |
| angular-countries-chart-view-master | 4 | `b32bf19af789fada667aa96472909b6f75a6ea210b55f0581915823bbcd6bb22` |
| angular-countries-chart-view-master | 6 | `c3c684a4be97d827cab87a4bd1b10f1f359bd1eda7ae8c3bb87f16ab58d133ed` |
| angular-countries-chart-view-master | 7 | `e6ed29adc467c7b3e6533eca85693ed9f236e10628febf91a6416d902e965a5a` |
| angular-countries-chart-view-mobile | 1 | `a041073a5176094e7235cfa440bae9bd49a6f3495e7877c80a95bdd408ae556f` |
| angular-countries-chart-view-mobile | 2 | `8dcb926bb1ab5f3d64b323d2b6a5cbe19e3d943467c74b04ab46eea8b465a232` |
| angular-countries-chart-view-mobile | 3 | `b2379770bcb87b06b804edb131cd8da467ae063a3b9c1b9258cfb0e62062b5e8` |
| angular-countries-chart-view-mobile | 4 | `b32bf19af789fada667aa96472909b6f75a6ea210b55f0581915823bbcd6bb22` |
| angular-countries-chart-view-mobile | 5 | `ae6d6df0f419f1dca5395a638b7a5dcbe790c0302d1b968af6a75df9fd20cadb` |
| angular-countries-chart-view-mobile | 6 | `c3c684a4be97d827cab87a4bd1b10f1f359bd1eda7ae8c3bb87f16ab58d133ed` |
| angular-countries-chart-view-mobile | 7 | `e6ed29adc467c7b3e6533eca85693ed9f236e10628febf91a6416d902e965a5a` |
| angular-countries-chart-view-mobile | 8 | `e4421460076e6552298c7b3ce771b2731e8e07506acb739f5dc343dfa7c5474a` |
| angular-countries-chart-view-mobile | 9 | `c2c6110881b9ebcd29bc348dd848e4f72e74c89f2a77fb705a8868f3fadec7cc` |
| angular-countries-chart-view-mobile | 10 | `aa7642a3fe46ec2ac105eef011a2a2040569d19e81aba4fc4da6da28bf930a4f` |
| angular-countries-chart-view-mobile | 11 | `f58f250418082bce27f4b2a8c97f814ae469be74768a9b76d13a0f342eba5a42` |
| angular-countries-chart-view-mobile | 12 | `34e3a62d6717f3f71ecf2bb76b42e734c6a5f1c3109cd86c910d31f0748ec545` |
| angular-countries-chart-view-mobile | 13 | `20017e2332ebb47a997b4e33cbfac0e7c4d090c4fe003f2031aa0829a539ce86` |
| angular-countries-chart-view-mobile | 14 | `b35e3c6f27a6e18a9cc50855cf413065de30d92502fc1bf9be74a9ed732c519c` |
| angular-countries-chart-view-mobile | 15 | `f0752b24a31e856ecd81661dafd6f31b87c1e9e925f956fcaff0c4325895e437` |
