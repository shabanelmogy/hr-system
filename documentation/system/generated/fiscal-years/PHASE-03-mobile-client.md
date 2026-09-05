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
| fiscal-years-master | 3 | `ccc1e6d3749ac91ff4e2408e9849fe8fdf77bfac6c3c2ee91f4a20d117fb0594` |
| fiscal-years-master | 4 | `a460b43fa6abe4003f8b26786686574974837756572467bddbf56ef66c136773` |
| fiscal-years-master | 6 | `c61603f2d747c9ea9d5c5c0dbec61ba19af29c8f378afac7131e65ec8659b438` |
| fiscal-years-master | 7 | `b3750a34f63ea59165176bbfdfde4267e123c0e9eed6ed0d09b5d821c9c45099` |
| fiscal-years-mobile | 1 | `65b8b6ebecf672a7734aea30cefb3acf4eb5014de08623c2aa7365bd405191f9` |
| fiscal-years-mobile | 2 | `e00aac64d8feccaaa91934ce687bb3ab964ce3aaef45040ff7756ca7abe49f41` |
| fiscal-years-mobile | 3 | `ec149637ae53f337412776f1d8a2e216c4f8278642fc2ca2c789826ba832fdfd` |
| fiscal-years-mobile | 4 | `ed778bbfc58129b43b9ffeed8de310ca6447a1cabbdb3c6627ccd2ec20c058af` |
| fiscal-years-mobile | 5 | `90bd8ba97d800cba0b9d5f1cadf99daa7cddb953f594331255f109f3b0c0c84d` |
| fiscal-years-mobile | 6 | `3537af0ac50f7f9f65b730fe8e3e50d6c226d4a65efcc0eb64b38b7cb79a24bb` |
| fiscal-years-mobile | 7 | `1a44701376347dd5cdaea6789aada9d0fa602ec6c2f1ac2997115da972dd6673` |
| fiscal-years-mobile | 8 | `63f77792e075c79b7f1a8cdebc8b2b3ea17774ce00ca300dc69737cd37a3d9d1` |
| fiscal-years-mobile | 9 | `2e7fa5bc0d34196489db933bbd648c9fd6b18b04bce5f90a6b6087776daf0470` |
| fiscal-years-mobile | 10 | `30718f35722bac64dcc821190ed1fcebfcb21b3555208e9016c3e0393b10cfa1` |
| fiscal-years-mobile | 11 | `be56c4107cac3e77f8ecc76f320e8ba708f846336318127f0604261f7faa0bdc` |
| fiscal-years-mobile | 12 | `afa5c7826e4e149a4c527271b8a0c97c0d7014f0572855dd16d824bcac346768` |
| fiscal-years-mobile | 13 | `3f13640075d29805a8558875e72dacd23dca6f0019c8b6f44d34da5b1c76c6ba` |
| fiscal-years-mobile | 14 | `1d813b3610e2493e2c27996783b2c0bcd0de7fbe2065dfd693707e186cf8d9d4` |
| fiscal-years-mobile | 15 | `5cc29e042de8aafe3f242d20718b0425cabf0fa6922db1b5540aa67d7a8eb382` |
