<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Shared form close and discard protection preparation Phase 03 - Expo Mobile Client

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

- **Shared form close and discard protection preparation cross-platform master review:** `../modules/platform/features/angular-form-close-foundation/angular-form-close-foundation-review.md` sections 3, 4, 6, 7
- **Shared form close and discard protection preparation Expo implementation profile:** `../modules/platform/features/angular-form-close-foundation/angular-form-close-foundation-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-form-close-foundation-master | 3 | `b6d3b49bbddbf4dab1481bed56bbcbea2646b7e3aed01ae0de50e7daff8e80c7` |
| angular-form-close-foundation-master | 4 | `5fc7d645c55b8674538b2405cbf039335f1c80730857fca4ea52a186dacb84c0` |
| angular-form-close-foundation-master | 6 | `d5fb222d29ead96431323a1755b2c748ea1335302de11d1ad14575291103f605` |
| angular-form-close-foundation-master | 7 | `0c884f06aa2e75bd9f136e9365f91561c4ef13e1f3e17a2c77e28a2700dd773f` |
| angular-form-close-foundation-mobile | 1 | `8f37c3f747e5d56ad0333f8861db30a5e7f82e557335bc8a8df1d8266454f67f` |
| angular-form-close-foundation-mobile | 2 | `4ab0b42bd0b34312c2e638a081f2d521b5b832d980c26ca738ff6c3c0421da13` |
| angular-form-close-foundation-mobile | 3 | `b6d3b49bbddbf4dab1481bed56bbcbea2646b7e3aed01ae0de50e7daff8e80c7` |
| angular-form-close-foundation-mobile | 4 | `5fc7d645c55b8674538b2405cbf039335f1c80730857fca4ea52a186dacb84c0` |
| angular-form-close-foundation-mobile | 5 | `9ff921df4fc4987bf8c7a0eeb12c2ad7d91105c91a00c35f6240c4efe1ebfdcc` |
| angular-form-close-foundation-mobile | 6 | `d5fb222d29ead96431323a1755b2c748ea1335302de11d1ad14575291103f605` |
| angular-form-close-foundation-mobile | 7 | `0c884f06aa2e75bd9f136e9365f91561c4ef13e1f3e17a2c77e28a2700dd773f` |
| angular-form-close-foundation-mobile | 8 | `af092a52399af807c36db18e03a6c61f0200e7224c489154f642658fba937053` |
| angular-form-close-foundation-mobile | 9 | `002c5fe15f5407d5954a85ce70ef6911009c88295b1c3e9a446352e1ab1b54b3` |
| angular-form-close-foundation-mobile | 10 | `64ded57526a8d16ecde8062de57ffe03d672821496b2b90463c0ad414b8c6d58` |
| angular-form-close-foundation-mobile | 11 | `010af5b5f1816905cc3eab29abd889a2eace387f4e457e73a24eae4fd88f464d` |
| angular-form-close-foundation-mobile | 12 | `3fc2e5d7e403b7d8d34c7e223add6ab92e092acbcd49957be85122e47b9c57e5` |
| angular-form-close-foundation-mobile | 13 | `e50853d075d6599db13a62e17466aceb8a03922b0075831025dc7600a97ab461` |
| angular-form-close-foundation-mobile | 14 | `0e0479a88af45e8fdad3c6e9d45d980aff52425b37fe385f664b9098f29422e6` |
| angular-form-close-foundation-mobile | 15 | `a0a6f1ba19e837a1de59300f14235daf86d940a40c79ac144f52cf4cd5f1e4c4` |
