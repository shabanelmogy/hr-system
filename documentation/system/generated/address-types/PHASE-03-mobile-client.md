<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Address Types Phase 03 - Expo Mobile Client

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

- **Address Types cross-platform master review:** `../project/ADDRESS_TYPES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Address Types Expo implementation profile:** `../mobile-react/address-types-mobile-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| address-types-master | 3 | `7df320a1cdbe421b7edf28e7bb0ed7c4ad026ba0d76af15dbb1ff27080f10f13` |
| address-types-master | 4 | `7308f8020bdbc0c722447f200a173af87d8fa4f5f3fb6bf250463bd9f057ef5a` |
| address-types-master | 6 | `b36e3f0234da7c53263dc870165993e8cc3d645939e7d9b5c2d85d617ed9c5e9` |
| address-types-master | 7 | `78e6057906c656526f8fb427486cc0fcf24d5fd8fb865fdb58d0a786b9cce3ba` |
| address-types-mobile | 1 | `0074ef0d666e3549c7f9c146a60607748e10d8def86f9c40691ce85485dd5f71` |
| address-types-mobile | 2 | `90348c7f9a0edf3bdd9ed0fc93ba14f932b2d50b4344841749965a2f5d7d5e87` |
| address-types-mobile | 3 | `58350328d61cf60c46769f6fd5d40296c1df27905a1e3115eff064319ea1c1bd` |
| address-types-mobile | 4 | `e97fa285fb049f33ba4a1ac982a082354bf4f67062fffa9b077bfa85c4350134` |
| address-types-mobile | 5 | `1fa855a19caa9d0080763f69f92fcf8af8ffc6c5aecd7ffef1b27fac25668d21` |
| address-types-mobile | 6 | `2feafc9ba243e55820b691a1179d596bcd756f73b7c90793b902f75ed2fe87c4` |
| address-types-mobile | 7 | `d9882f353f9ba8bee481890d92d881bd0f9b54e7318171657e3a4f24ffbcb9e9` |
| address-types-mobile | 8 | `b2c372b06a1b46268447ca2f1163e3f799955b48d644c77fc1faedc582316594` |
| address-types-mobile | 9 | `1eb3eeeb4af6f72d4dc6b92406f29f8886c3b7d535241bdedf64b9fb3a2faa57` |
| address-types-mobile | 10 | `be75a56fd912809ad9b5f8182a667a56fde2a1fabef7ac4db5eb3046e994e6cf` |
| address-types-mobile | 11 | `6728484eaad5c096796aba4b1c30c8e72109a355c1b087d00688e38426f88e98` |
| address-types-mobile | 12 | `0962664fa05ebebe56976f4ae35716f2ed427bdd21a8fabe8af7197b72b7c307` |
| address-types-mobile | 13 | `13b2357cca2da82092819c30cfee60609d360b8b6d299ce4127cb5f120ef2479` |
| address-types-mobile | 14 | `b38f608a88bd0703b059047dbd8102d44f80b028d6959f2fc9d0b2dc69d2b4aa` |
| address-types-mobile | 15 | `22bf074cab1a83481fef4c63b81aaa5747d0fc1f013506c2e02e2c2cc1ba7f7f` |
