<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Shared numeric field preparation Phase 03 - Expo Mobile Client

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

- **Shared numeric field preparation cross-platform master review:** `../modules/platform/features/angular-numeric-field-foundation/angular-numeric-field-foundation-review.md` sections 3, 4, 6, 7
- **Shared numeric field preparation Expo implementation profile:** `../modules/platform/features/angular-numeric-field-foundation/angular-numeric-field-foundation-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-numeric-field-foundation-master | 3 | `a50c22c49537c886bb84e2789f3d24298e83a88fe2487e956e0bf5f20be556c7` |
| angular-numeric-field-foundation-master | 4 | `edd3f9b373462b8ac2e64a379419a7edef45614e218a0945bee7f04a1b1c1ff9` |
| angular-numeric-field-foundation-master | 6 | `90b3b447db8e251821cbabd42393b6d0c97cc58f0052d655106388445265d12c` |
| angular-numeric-field-foundation-master | 7 | `11121dae5fcc238d7bb7f4cc47b7e1327f9537faa434a5060adf9297b801985d` |
| angular-numeric-field-foundation-mobile | 1 | `d9547b87dad56479ed7a9f5d16a79af3327c020dc429a43ec5b7d28c8181fd70` |
| angular-numeric-field-foundation-mobile | 2 | `414f2867556665bcb83f2f1ed4794d3185f8f25b5100ebaa9f80e127a10cb98b` |
| angular-numeric-field-foundation-mobile | 3 | `a50c22c49537c886bb84e2789f3d24298e83a88fe2487e956e0bf5f20be556c7` |
| angular-numeric-field-foundation-mobile | 4 | `edd3f9b373462b8ac2e64a379419a7edef45614e218a0945bee7f04a1b1c1ff9` |
| angular-numeric-field-foundation-mobile | 5 | `154795d81507bf30a922336b9c6d501fed92fa3a543520746a1f5b2712a86510` |
| angular-numeric-field-foundation-mobile | 6 | `90b3b447db8e251821cbabd42393b6d0c97cc58f0052d655106388445265d12c` |
| angular-numeric-field-foundation-mobile | 7 | `11121dae5fcc238d7bb7f4cc47b7e1327f9537faa434a5060adf9297b801985d` |
| angular-numeric-field-foundation-mobile | 8 | `cf660dea88733a16bc9c17ce4231c1fba6e5afc89865ef26e10d334ba735be9a` |
| angular-numeric-field-foundation-mobile | 9 | `ce837fa5be7fa391f4de61e5ec453337c57b3171ba9948aa2f36bebc0ceaf8d0` |
| angular-numeric-field-foundation-mobile | 10 | `0bd7827ed769528e2ab4bb6c555c68c6ba376f2c580ed0da78d2aaba1aeae03c` |
| angular-numeric-field-foundation-mobile | 11 | `c05dd60d5967720bf86a0cf631db3fd61c433ee0edb31e9aacf9fe38cfc97bcc` |
| angular-numeric-field-foundation-mobile | 12 | `70c394f21d68ed7b27d6a603691fc12f698a32daa54587498947440364873013` |
| angular-numeric-field-foundation-mobile | 13 | `260b6bbb722334d7f00f2ce0e9832a63fff0dce90b143b8ab2bc33d35f62ddf1` |
| angular-numeric-field-foundation-mobile | 14 | `bd0a578158850deda7f804e0a6519f7f46daee3c01352b71847bd16af088ce15` |
| angular-numeric-field-foundation-mobile | 15 | `01d2ce9fe177a828ba7704a0c32938e72850f349533cfcedbfa5736d03335bb4` |
