<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Angular Company Context Phase 03 - Expo Mobile Client

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

- **Angular Company Context cross-platform master review:** `../modules/platform/features/angular-company-context/angular-company-context-review.md` sections 3, 4, 6, 7
- **Angular Company Context Expo implementation profile:** `../modules/platform/features/angular-company-context/angular-company-context-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-company-context-master | 3 | `de45d458f6bea39cbce3f586b3d58ba78942d26311965ecbe210bdb9917fae90` |
| angular-company-context-master | 4 | `33ac2b68366190503fea644fa25ab07f6f4db8bac30ec031b362cd61c25770a3` |
| angular-company-context-master | 6 | `d358079c04f995e0f06a80047c596457bf688c2606c38afa5af000425e8d7324` |
| angular-company-context-master | 7 | `a6989eff1f1c1a31c97de9a9493237f71b0976d722153e3061380c57c221d6f6` |
| angular-company-context-mobile | 1 | `15a926ff18ed519b273cbeea7f89d121bee414d9b8dbabd7ad78a4ba1a20d72e` |
| angular-company-context-mobile | 2 | `f5cb088c899901db4325210a2618ebbd13cf9309cd6f9c102d5449f54d6d6e38` |
| angular-company-context-mobile | 3 | `de45d458f6bea39cbce3f586b3d58ba78942d26311965ecbe210bdb9917fae90` |
| angular-company-context-mobile | 4 | `33ac2b68366190503fea644fa25ab07f6f4db8bac30ec031b362cd61c25770a3` |
| angular-company-context-mobile | 5 | `96f6a5e9a4801d5701a98c5751a4d6ff78f89023a355368a6af7ad50c4601a18` |
| angular-company-context-mobile | 6 | `d358079c04f995e0f06a80047c596457bf688c2606c38afa5af000425e8d7324` |
| angular-company-context-mobile | 7 | `a6989eff1f1c1a31c97de9a9493237f71b0976d722153e3061380c57c221d6f6` |
| angular-company-context-mobile | 8 | `834ac0a66a13b464cf0ec1dcde0d92abbe02ed2eeb9ac63a7b438ba6203fd389` |
| angular-company-context-mobile | 9 | `d132938c99a9616bfa53df535c2a6fd45aff5a6ad81fa0d6f3f921758a806f08` |
| angular-company-context-mobile | 10 | `2dc6d4c18f56599e8f391bb6e5b7e07352be81e8ebeb0028b9e0917e3cb86c4e` |
| angular-company-context-mobile | 11 | `1143b113c8297b174b9d634a216df28433520c46a609679ab3f798c7c9c6a9ad` |
| angular-company-context-mobile | 12 | `c22e835b038d8a04dcc0fb1af7298a14be4d399cf9bcac423b889f80fd2f0937` |
| angular-company-context-mobile | 13 | `b3b5c35ad2ec7169cce70d7c8b4cb6c3a5f176100ac79557040078938853f35a` |
| angular-company-context-mobile | 14 | `8d79eb0ecdd585e6a103175fe0e9875fb60d1086f1e3a8104921a66a52b76b89` |
| angular-company-context-mobile | 15 | `ddefe8da934c11cc2f7075936e63a14ee1f13b937a68344cabdf32bde2099780` |
