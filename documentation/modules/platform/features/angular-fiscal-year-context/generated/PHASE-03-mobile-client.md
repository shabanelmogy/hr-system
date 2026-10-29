<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Angular Accounting Working Fiscal Year Context Phase 03 - Expo Mobile Client

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

- **Angular Accounting Working Fiscal Year Context cross-platform master review:** `../modules/platform/features/angular-fiscal-year-context/angular-fiscal-year-context-review.md` sections 3, 4, 6, 7
- **Angular Accounting Working Fiscal Year Context Expo implementation profile:** `../modules/platform/features/angular-fiscal-year-context/angular-fiscal-year-context-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-fiscal-year-context-master | 3 | `78a70d62abbc68d4b52fbe7247338e9e717b0d1fa1d80b44f0bd2909137c1435` |
| angular-fiscal-year-context-master | 4 | `10cc7bacfef82781a35937d2f9c3707560c56ea7880c51cff639a1a9ed9ff201` |
| angular-fiscal-year-context-master | 6 | `635c342420a279993389ee092ec0b96324f8769c43dff3798dfc00b0c5bdcc2f` |
| angular-fiscal-year-context-master | 7 | `95aca8b7614b795b9e57bf5a8af30d7b64f01a711d06cb082e2e57d07bf7172d` |
| angular-fiscal-year-context-mobile | 1 | `38809e7e4b45b59fcb39b5a816a361876064ca0e2b3b1fd927bf5366096c84f7` |
| angular-fiscal-year-context-mobile | 2 | `5234c2c14b64c208b69e9e7173adb27a26c5c6f53b270bcb0ab6d943175fc5fa` |
| angular-fiscal-year-context-mobile | 3 | `78a70d62abbc68d4b52fbe7247338e9e717b0d1fa1d80b44f0bd2909137c1435` |
| angular-fiscal-year-context-mobile | 4 | `10cc7bacfef82781a35937d2f9c3707560c56ea7880c51cff639a1a9ed9ff201` |
| angular-fiscal-year-context-mobile | 5 | `759abf819f4a0722c3de342678debdce87e27ea63ae80cd8742619a7fa87fb41` |
| angular-fiscal-year-context-mobile | 6 | `635c342420a279993389ee092ec0b96324f8769c43dff3798dfc00b0c5bdcc2f` |
| angular-fiscal-year-context-mobile | 7 | `95aca8b7614b795b9e57bf5a8af30d7b64f01a711d06cb082e2e57d07bf7172d` |
| angular-fiscal-year-context-mobile | 8 | `c12e820ddc46305e7cb7da2b70ac8dd234c92fcc7a90576f50b17b92d9a53a12` |
| angular-fiscal-year-context-mobile | 9 | `936948f2cf78578f94106ac5f860f87c2fe4e4986e3740c23f1dc37963f132f1` |
| angular-fiscal-year-context-mobile | 10 | `bb2941ee2b55b076a6ff92db814d6388a469f272b33c66f16346b1c6b2fa8ead` |
| angular-fiscal-year-context-mobile | 11 | `a4f449a68c7398071ffa4f5a1ae79dac8ca0f517dddebd5d5b9db07e333ca92d` |
| angular-fiscal-year-context-mobile | 12 | `21e42d8f39ad9083f19d1006eec45d703fbe8f2ce4cb6ba12ae12632c7da363d` |
| angular-fiscal-year-context-mobile | 13 | `829ca6778f3847d87c18fe252e7c87b921a06c00d5ef65b64a7ff4e19796505f` |
| angular-fiscal-year-context-mobile | 14 | `84f0ac93a5568b5278702ae5e4344a27313a3d0d30d5044cc960a5a16f9dca87` |
| angular-fiscal-year-context-mobile | 15 | `4659ff5891cd71ad2aac69f8aaf7b319bfdde5b9f23862dbb590d7e76feb16b0` |
