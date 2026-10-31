<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Angular Role Home Phase 03 - Expo Mobile Client

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

- **Angular Role Home cross-platform master review:** `../modules/platform/features/angular-role-home/angular-role-home-review.md` sections 3, 4, 6, 7
- **Angular Role Home Expo implementation profile:** `../modules/platform/features/angular-role-home/angular-role-home-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-role-home-master | 3 | `e048bd0ced8c61c21dd123c60b8970593fb7caec43ef695f3a15d43ce1ba450d` |
| angular-role-home-master | 4 | `0b512f0ad7afaa343b36e43ab0148064b2a42e0dd51f3d682d7de6e0570920e6` |
| angular-role-home-master | 6 | `e127c53db94b549e9a0839a46884007b0cb45407d19b1f32fe03d7fbc884e21d` |
| angular-role-home-master | 7 | `c1c548649c4b8f25bfa58b9c5e31aff3d5b9dd128868657c9f2295058e414d4d` |
| angular-role-home-mobile | 1 | `f984be175a16c176b96a040e2653b65d903c05bee762fe5a3c150470c6a97bb5` |
| angular-role-home-mobile | 2 | `b897606c0ca6644b476e0d49a4efb8d0c00b2b42c1b37d8f6282224dcb9ad071` |
| angular-role-home-mobile | 3 | `e048bd0ced8c61c21dd123c60b8970593fb7caec43ef695f3a15d43ce1ba450d` |
| angular-role-home-mobile | 4 | `0b512f0ad7afaa343b36e43ab0148064b2a42e0dd51f3d682d7de6e0570920e6` |
| angular-role-home-mobile | 5 | `563cf43ec82636430fe4e20f38f8398ba1e21e6344b16f5d7af85ccd4943fec2` |
| angular-role-home-mobile | 6 | `e127c53db94b549e9a0839a46884007b0cb45407d19b1f32fe03d7fbc884e21d` |
| angular-role-home-mobile | 7 | `c1c548649c4b8f25bfa58b9c5e31aff3d5b9dd128868657c9f2295058e414d4d` |
| angular-role-home-mobile | 8 | `d28963b7a469ef83b975e057f57db47703ca3b8fd120d21ff3b4b6497b8a656f` |
| angular-role-home-mobile | 9 | `60f9c606d5d26a6f8a4c4dc82559183bcd0269bd903190817574405dbd36670f` |
| angular-role-home-mobile | 10 | `1c839c0e89ee2594c02d7b00912de2fcf2e0690ef23d50b52255e5491a33fe20` |
| angular-role-home-mobile | 11 | `091fbcbc24ef465bd0fa7e2e1b02611b0ddaca9d52a29c2deb40c8220573e104` |
| angular-role-home-mobile | 12 | `61c9f87d0e0bbe8f149e1ec5f4dd673d136de6fe271eed0177c4ef0c3e7055c4` |
| angular-role-home-mobile | 13 | `e55af14d30d5c713f1629c69ece73be17f6f6f02273c21e4a7c067af65869cdc` |
| angular-role-home-mobile | 14 | `1d027bc20ed0bcbe5fb1530e64bdab6f6dfee98c396873ba3fc376bf8a5f2005` |
| angular-role-home-mobile | 15 | `ae3d868cb4ab8937d5dc057abf44e72deda56eaf166efd283c40897473b739da` |
