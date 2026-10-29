<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Angular Password Sign-in and Session Entry Phase 03 - Expo Mobile Client

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

- **Angular Password Sign-in and Session Entry cross-platform master review:** `../modules/platform/features/angular-password-sign-in/angular-password-sign-in-review.md` sections 3, 4, 6, 7
- **Angular Password Sign-in and Session Entry Expo implementation profile:** `../modules/platform/features/angular-password-sign-in/angular-password-sign-in-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-password-sign-in-master | 3 | `d5e936d54807668736382545378507c26cca64348e0b3da20e4c67577ffbbddd` |
| angular-password-sign-in-master | 4 | `d06b04062d6c005d2e30e19b963b1a4ce012c21c495812ea6ecba8ce076468e7` |
| angular-password-sign-in-master | 6 | `0e3a09ab847df948a96ac927449465c464811f6340cf891e2ae5a8ff7a770f89` |
| angular-password-sign-in-master | 7 | `e4f6797163f888606842779e37f5fd483d649ff93504447be1234913e9563c6d` |
| angular-password-sign-in-mobile | 1 | `4d04517f7c89c559c891a7a8b66307fc8c056b2b55263b7f2320af01a707a662` |
| angular-password-sign-in-mobile | 2 | `afd865510b9657196a4e70f2a940fb71485b8e7c71268f84cfe9c5cc65a8fc86` |
| angular-password-sign-in-mobile | 3 | `d5e936d54807668736382545378507c26cca64348e0b3da20e4c67577ffbbddd` |
| angular-password-sign-in-mobile | 4 | `d06b04062d6c005d2e30e19b963b1a4ce012c21c495812ea6ecba8ce076468e7` |
| angular-password-sign-in-mobile | 5 | `16451bc961f142c6a8c1c431ff6c340da11492ea5f23843de448ef5b3d3dafcb` |
| angular-password-sign-in-mobile | 6 | `0e3a09ab847df948a96ac927449465c464811f6340cf891e2ae5a8ff7a770f89` |
| angular-password-sign-in-mobile | 7 | `e4f6797163f888606842779e37f5fd483d649ff93504447be1234913e9563c6d` |
| angular-password-sign-in-mobile | 8 | `20bb0006bf41335f8388d59ee615c62130b86c47d6054816da5b6ffffcd1ef4f` |
| angular-password-sign-in-mobile | 9 | `1c4d78b720a7cdf945b7660d390d8dc8231cdb31b67d5839949dd89d27c6741e` |
| angular-password-sign-in-mobile | 10 | `ca3239d03a84ac7440b0a9d7d9bb7a9b26160ab88f976e7084951110f8210966` |
| angular-password-sign-in-mobile | 11 | `f29eb371e5fdf8dd9fa760be380d9fc7883aa336f094a45c0809293be5ea1032` |
| angular-password-sign-in-mobile | 12 | `e1236d5a6672c5efd5942f0d28c5e0e3f2a91e52ed676c1ffa4ea9c514dad1b1` |
| angular-password-sign-in-mobile | 13 | `6579caaa1aa7b33f80bcd9dc58af531a38a3bfc4e7b4d4eb7490ef3342106645` |
| angular-password-sign-in-mobile | 14 | `dd02cbcbb56b2a58649f3ea4d90dfdedb6059d2ed8bfa6c6cdb25f495640158e` |
| angular-password-sign-in-mobile | 15 | `2b1aa65c0089e0b2fd7fa5aa8927a32302817184b8b90cc6403f9c0091213480` |
