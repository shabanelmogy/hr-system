<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Fiscal Years Phase 03 - Expo Mobile Client

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

- **Fiscal Years cross-platform master review:** `../project/FISCAL_YEARS_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Fiscal Years Expo implementation profile:** `../mobile-react/fiscal-years-mobile-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| fiscal-years-master | 3 | `8390cefc7a311be46bc6e92580fcbe7aff06ff47aaa4ac187f90cd7e66903da8` |
| fiscal-years-master | 4 | `a138eeba03b2c75a88c481f8ecad0b88cd339b53f5c26f67fc52bf62d2da13bf` |
| fiscal-years-master | 6 | `a441290822263415d40f5bdaca531bce89957f82d6491760dac44cab5853fe6e` |
| fiscal-years-master | 7 | `2d676a37e47f0762d9822c902b57ad4f35040c56ffdc980efbb455187382dfee` |
| fiscal-years-mobile | 1 | `a8e167a74a81c4539d8bd56040c5e18c7decccf6bfba28169f370940442fc09d` |
| fiscal-years-mobile | 2 | `104021a84636098858e2c39aca079d2288b8d27ad6356d8a185339f1771f1484` |
| fiscal-years-mobile | 3 | `ec149637ae53f337412776f1d8a2e216c4f8278642fc2ca2c789826ba832fdfd` |
| fiscal-years-mobile | 4 | `ed778bbfc58129b43b9ffeed8de310ca6447a1cabbdb3c6627ccd2ec20c058af` |
| fiscal-years-mobile | 5 | `fe3c721d3318c3c4ac42baf705e8238c4d235e99439c0750a691d9bf057621dc` |
| fiscal-years-mobile | 6 | `3537af0ac50f7f9f65b730fe8e3e50d6c226d4a65efcc0eb64b38b7cb79a24bb` |
| fiscal-years-mobile | 7 | `1a44701376347dd5cdaea6789aada9d0fa602ec6c2f1ac2997115da972dd6673` |
| fiscal-years-mobile | 8 | `63f77792e075c79b7f1a8cdebc8b2b3ea17774ce00ca300dc69737cd37a3d9d1` |
| fiscal-years-mobile | 9 | `2e7fa5bc0d34196489db933bbd648c9fd6b18b04bce5f90a6b6087776daf0470` |
| fiscal-years-mobile | 10 | `30718f35722bac64dcc821190ed1fcebfcb21b3555208e9016c3e0393b10cfa1` |
| fiscal-years-mobile | 11 | `52260959e8e4915eb5304aceea135dd4715ff6ff3ded05dacbd3e6be022fab0c` |
| fiscal-years-mobile | 12 | `afa5c7826e4e149a4c527271b8a0c97c0d7014f0572855dd16d824bcac346768` |
| fiscal-years-mobile | 13 | `3f13640075d29805a8558875e72dacd23dca6f0019c8b6f44d34da5b1c76c6ba` |
| fiscal-years-mobile | 14 | `1d813b3610e2493e2c27996783b2c0bcd0de7fbe2065dfd693707e186cf8d9d4` |
| fiscal-years-mobile | 15 | `fb2e090b54e4a1451c3407806070f10bf9908680d4a8a45e99f5d7135202f2f5` |
