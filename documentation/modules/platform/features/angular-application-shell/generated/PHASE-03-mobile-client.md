<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Angular Application Shell Phase 03 - Expo Mobile Client

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

- **Angular Application Shell cross-platform master review:** `../modules/platform/features/angular-application-shell/angular-application-shell-review.md` sections 3, 4, 6, 7
- **Angular Application Shell Expo implementation profile:** `../modules/platform/features/angular-application-shell/angular-application-shell-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-application-shell-master | 3 | `f2aacdc73cc17945bc17eb5c69923fbdf857d48106aba97f6953101712ccc647` |
| angular-application-shell-master | 4 | `caf058a22c30460e1e9b20a688f77f8ced402b30e75d5e7619a99c59618b66b4` |
| angular-application-shell-master | 6 | `faabbbe88bf326eea9511bbf97bec39a1b42c35ce2230c655e71672291c3231c` |
| angular-application-shell-master | 7 | `38103c6fc5fc366e8d4808935148f4982bc2ff7a1077bc6b47866a5a59341914` |
| angular-application-shell-mobile | 1 | `8420f91086a38d7869bb125bbf216e4334ec46e04700b4dfe8662f2e77609f95` |
| angular-application-shell-mobile | 2 | `832cb5332e6be88662481f48f16fdc3a2fa6b0c2b135e9ed874308ded3bf9051` |
| angular-application-shell-mobile | 3 | `f2aacdc73cc17945bc17eb5c69923fbdf857d48106aba97f6953101712ccc647` |
| angular-application-shell-mobile | 4 | `caf058a22c30460e1e9b20a688f77f8ced402b30e75d5e7619a99c59618b66b4` |
| angular-application-shell-mobile | 5 | `37689c61ee256203558078245aefc583e90e595faf6b21072222d367bc563cdd` |
| angular-application-shell-mobile | 6 | `faabbbe88bf326eea9511bbf97bec39a1b42c35ce2230c655e71672291c3231c` |
| angular-application-shell-mobile | 7 | `38103c6fc5fc366e8d4808935148f4982bc2ff7a1077bc6b47866a5a59341914` |
| angular-application-shell-mobile | 8 | `ca4ee16c814aceee76194125377f3bd6b8f2007d2ba647b8d7ddbdae5617834e` |
| angular-application-shell-mobile | 9 | `171a213120b293cd32c3bb0e2ec90a86d4baff38de60c8ec38a72053fa61aced` |
| angular-application-shell-mobile | 10 | `99e22673f4a63eb2aa922a85364d71c0c32f7b06bf02467ab629acd0288e8de1` |
| angular-application-shell-mobile | 11 | `4afad814fac09a3ae3647a6a443a6ee3d0a50162a0a2ca29ddaff98d0e28120f` |
| angular-application-shell-mobile | 12 | `148e66f157845465d73081eb09cd5b24e8a38d6978de8c68df5626ffe4449a18` |
| angular-application-shell-mobile | 13 | `0f31d57c1a04f5819829d63ecd548287884d582fa148b1f26eaee0f86a906590` |
| angular-application-shell-mobile | 14 | `e71f5d6a2e12eb1fea6e3129fcdfbab05769cb4275c95c14a1e9d2888d88e057` |
| angular-application-shell-mobile | 15 | `9decaf031292c3b4e868f05781846b96c45f7443d62d9fa6fd25d4e7cc89e431` |
