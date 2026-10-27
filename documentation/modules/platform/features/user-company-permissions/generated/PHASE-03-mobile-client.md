<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Company user permission grants Phase 03 - Expo Mobile Client

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

- **Company user permission grants cross-platform master review:** `../modules/platform/features/user-company-permissions/user-company-permissions-review.md` sections 3, 4, 6, 7
- **Company user permission grants Expo implementation profile:** `../modules/platform/features/user-company-permissions/user-company-permissions-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| user-company-permissions-master | 3 | `756ebf92386e969f43be116106e92c0a570dadabdaf843e7672c3d772653943f` |
| user-company-permissions-master | 4 | `430044ad5b767ae3900caf16f98f07eb86dd7c7554c61c731ac605f65de84680` |
| user-company-permissions-master | 6 | `38e2c11893e8006dff70b461aaaaafcf8eb2e0aebb41a699ebd687473a153fc3` |
| user-company-permissions-master | 7 | `fc892ef575fb17921faf7c27fb0aa6f4e37f3f9991548802009cc663a1519d5e` |
| user-company-permissions-mobile | 1 | `561692f2068bba5d88801db99fa54aa1073ad362e01155cfae7b069ffe3b12c2` |
| user-company-permissions-mobile | 2 | `2943318c6241f7b16eaf317945cc98bd99284388a7b7ab09d15aac3051f7165c` |
| user-company-permissions-mobile | 3 | `756ebf92386e969f43be116106e92c0a570dadabdaf843e7672c3d772653943f` |
| user-company-permissions-mobile | 4 | `430044ad5b767ae3900caf16f98f07eb86dd7c7554c61c731ac605f65de84680` |
| user-company-permissions-mobile | 5 | `0a5de5672c9bf63cefc21499e645994b499b01a9999c0563a733feb7a361c039` |
| user-company-permissions-mobile | 6 | `38e2c11893e8006dff70b461aaaaafcf8eb2e0aebb41a699ebd687473a153fc3` |
| user-company-permissions-mobile | 7 | `fc892ef575fb17921faf7c27fb0aa6f4e37f3f9991548802009cc663a1519d5e` |
| user-company-permissions-mobile | 8 | `82e367723ae40c48a6ebd7996337d790ed10c9e178aee51f49ce1038c4a8c896` |
| user-company-permissions-mobile | 9 | `f84749af9d320ccfd69017091157101cc8697821c62a683ab73a02dfc2e338f6` |
| user-company-permissions-mobile | 10 | `04d729d73d70bbf01c5ab66c715c4e5c10064ab6fab26737d39ed6e021f55c24` |
| user-company-permissions-mobile | 11 | `47b385d6144ecc3f4dccc5eb270d800053f32d9d5f7710619626de847c0e3df4` |
| user-company-permissions-mobile | 12 | `3bc15e98a11e24ffdf9d7c1f10ac4cd3f9b57db3f9dadf47c5d9a99d10e6c039` |
| user-company-permissions-mobile | 13 | `4e889133e082456b5a4c3cd18b0ac78fdd1b875682672183455e445d23826e81` |
| user-company-permissions-mobile | 14 | `e7d0949a1538a1a1a2f89c390616e73e2a214d79b6a9fcc2db386db070a7e2eb` |
| user-company-permissions-mobile | 15 | `498e787689db01b6c63af622723517cfc79817446fa05d395dcc959ab50b7d0d` |
