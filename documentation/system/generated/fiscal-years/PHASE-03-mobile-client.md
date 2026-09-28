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
| fiscal-years-master | 3 | `258121a15c42bd254f087460a281f57839ee2f56a36f373905ca0c952ed6cbe9` |
| fiscal-years-master | 4 | `ae8155eb0f3e367113ca06829c8dc5a977d40f300ab07eac4bc4c0d34b923075` |
| fiscal-years-master | 6 | `225416faf8af3c0eb0b46137e7224277e9ffe1f40b17bd0395016d24ec503d41` |
| fiscal-years-master | 7 | `e2fdfb210fe8576c90f77e555f0da8b731dfc15d2bd9a2002fcd913f4901e887` |
| fiscal-years-mobile | 1 | `a8e167a74a81c4539d8bd56040c5e18c7decccf6bfba28169f370940442fc09d` |
| fiscal-years-mobile | 2 | `104021a84636098858e2c39aca079d2288b8d27ad6356d8a185339f1771f1484` |
| fiscal-years-mobile | 3 | `111a5c4963c13cf1f8f4a8b6ce3bf790f18743b6605d1f48ce74ba498d7bf4b3` |
| fiscal-years-mobile | 4 | `b0eb9b2a56e5be35e76eb23c44f3721d89a89d7e110fc86246c230f2c4e52acf` |
| fiscal-years-mobile | 5 | `fe3c721d3318c3c4ac42baf705e8238c4d235e99439c0750a691d9bf057621dc` |
| fiscal-years-mobile | 6 | `3537af0ac50f7f9f65b730fe8e3e50d6c226d4a65efcc0eb64b38b7cb79a24bb` |
| fiscal-years-mobile | 7 | `e292f9eb73d8646591dc555e12239e80bc6ba086a3d55cc85f657be2683a8726` |
| fiscal-years-mobile | 8 | `f7910c90c42bdd70c2010ee500bce3f2a61f7ce3c95154f4be4ca08c897eec74` |
| fiscal-years-mobile | 9 | `82f87fdc621b6e6c92dd0b85164152df8b2624fc55af606d2ab51e0c8073e475` |
| fiscal-years-mobile | 10 | `30718f35722bac64dcc821190ed1fcebfcb21b3555208e9016c3e0393b10cfa1` |
| fiscal-years-mobile | 11 | `e9554663aafac0e73cc879def0bd6a7f77caf44209e7ce53c0df2d2d9b6506b9` |
| fiscal-years-mobile | 12 | `3c2c8033d8473b5a87e710bcd493bd306471022ce5a27fb83521c8db60f8c3e9` |
| fiscal-years-mobile | 13 | `3f13640075d29805a8558875e72dacd23dca6f0019c8b6f44d34da5b1c76c6ba` |
| fiscal-years-mobile | 14 | `1d813b3610e2493e2c27996783b2c0bcd0de7fbe2065dfd693707e186cf8d9d4` |
| fiscal-years-mobile | 15 | `271b0c79f5c2fa68e88f9d30f9c456a963db379a01e8becd335fb935ad2b7434` |
