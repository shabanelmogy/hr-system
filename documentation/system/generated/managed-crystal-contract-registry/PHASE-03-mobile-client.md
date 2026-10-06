<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Managed Crystal Contract Registry Phase 03 - Expo Mobile Client

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

- **Managed Crystal Contract Registry cross-platform master review:** `../project/MANAGED_CRYSTAL_CONTRACT_REGISTRY_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Managed Crystal Contract Registry Expo implementation profile:** `../mobile-react/managed-crystal-contract-registry-mobile-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-contract-registry-master | 3 | `868e9bbb67b82d3949d71fde30b56870b8dde13c345793fdf5f3aca712d3e048` |
| managed-crystal-contract-registry-master | 4 | `8f299058d6b0fa1871fc583289549498805511fc5edcd4283b6cd1f6fb06f516` |
| managed-crystal-contract-registry-master | 6 | `e987bebc42adb87b9650b15783b0f6a5619c9207ba2a847e75674a4775c40e24` |
| managed-crystal-contract-registry-master | 7 | `650941c9496a8555d485db43353c67ba57b588414dc301a23d8dce4ac5d415bb` |
| managed-crystal-contract-registry-mobile | 1 | `e23713002c5f4d6f8683ad29b27288c149e732d3ca54eb4034ecdc8d63c08542` |
| managed-crystal-contract-registry-mobile | 2 | `529b05ea902e1b72f795cc3b631837a039e1e417b35fdc41d130303fe6abc21f` |
| managed-crystal-contract-registry-mobile | 3 | `e4ac3f30b166627346ccbdff8f99e5b4a6be699fe47b41ebb46b334ec523f823` |
| managed-crystal-contract-registry-mobile | 4 | `544970f1e4df89633aa9ac08f223fb7388ef1af3224230179271b339f2e0c29f` |
| managed-crystal-contract-registry-mobile | 5 | `e8740072757c67eb7d16b1b2319429d2ed491f0778544bd8ab5fe9a8581549f2` |
| managed-crystal-contract-registry-mobile | 6 | `c5eba359eb4a001d8d436609659a1f0e2a756b6be03ee1623fbca925abba3666` |
| managed-crystal-contract-registry-mobile | 7 | `db356a1f52bace37c4cd7a634a52f6ac898ed620e0c8627374f16ac3407dc783` |
| managed-crystal-contract-registry-mobile | 8 | `bd0c19626cbfe98ef162fd9ccd62cdef3cc38380c6d7cfc43d494e8cba959c3e` |
| managed-crystal-contract-registry-mobile | 9 | `8b88cb5e7a406ad351234aec940277ac3af39b831d67eeb96ac9862bf30f18f8` |
| managed-crystal-contract-registry-mobile | 10 | `faa21e171e5cad10e9ae5207e7c8f6c835551c4927b74612dea3cbd4e8a9d08f` |
| managed-crystal-contract-registry-mobile | 11 | `cba911103ac459014c19924ea5628fb9673222c8e3e1d76ecc1cd49afa7c35f7` |
| managed-crystal-contract-registry-mobile | 12 | `96bd27e203dfb9f94ae22fdc087b23d7b0b1129b646ef6400c09a86f743b5bb7` |
| managed-crystal-contract-registry-mobile | 13 | `298f3812a386f03d60599d17f6ad282fe90fcecbd61a0a3e69ab228877c01cba` |
| managed-crystal-contract-registry-mobile | 14 | `706f30fc618ce61509ac8893ffbde1db1bdc3dc6a3c66bdff62e0b7064f82c13` |
| managed-crystal-contract-registry-mobile | 15 | `427b4e3385025a3de716d50a97c2fddb3cc82dd28705db33dc0ee3099a1b04ae` |
