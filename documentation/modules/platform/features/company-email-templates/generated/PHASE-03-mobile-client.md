<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Company email templates Phase 03 - Expo Mobile Client

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

- **Company email templates cross-platform master review:** `../modules/platform/features/company-email-templates/company-email-templates-review.md` sections 3, 4, 6, 7
- **Company email templates Expo implementation profile:** `../modules/platform/features/company-email-templates/company-email-templates-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-email-templates-master | 3 | `8cfceb41ccd21b6f52a9dbaa638bff99dadf8a412a1db8855124cfa4b36f337e` |
| company-email-templates-master | 4 | `ecf324faf8fb27d4110c34672c429c9f8664b54d71c0fe07f24641366780567f` |
| company-email-templates-master | 6 | `8ed77bb6949b5a4989589bba630b031ff6adc4d6a87ddc0b4758137c1021b5b0` |
| company-email-templates-master | 7 | `b806a110148b1bc25878a8c0537a288061646b9c75caf91bcf77dc745e7980a2` |
| company-email-templates-mobile | 1 | `6d92824ae35b2d4b9972b5915ab5e35da2802324578f529d3885db08bf1e79e1` |
| company-email-templates-mobile | 2 | `ef2f315e36c85167a3e1e86cd6fad960c1c9c56d84051348cded7e6cabdb2f63` |
| company-email-templates-mobile | 3 | `ed446009f3cfe916e804b92fb98fd2f2d7e8d491ce5f91f33029e2a3d9f736ff` |
| company-email-templates-mobile | 4 | `ce84a1d17a8b45b1a971a982ab093a87212edef7c703d0d1f2443ca4afa1725a` |
| company-email-templates-mobile | 5 | `0362d1c0caead1fda548989ac8e46b5271365eb5e6f98e1755ea0d59d4174b05` |
| company-email-templates-mobile | 6 | `05e13bfe5fb69a7803f8040f6acb51ec0bcd3255afd053d10602226ec7f93f47` |
| company-email-templates-mobile | 7 | `cc74d6122dd9cff4eb3fb78a558c8ee738e87861fd5de6737c44fc31c62df7aa` |
| company-email-templates-mobile | 8 | `d930ce6cdc898ac54b03a1232c043929f6aebd0bd96f9ad3d4a418548975405b` |
| company-email-templates-mobile | 9 | `abd4b786d0bace04600c3c7334993e45b36f3d85333edd933d4f9058bedddbeb` |
| company-email-templates-mobile | 10 | `c1262e113c9347c341577f50e04883b503211cf3966692b2ec5cef1f9a487cf5` |
| company-email-templates-mobile | 11 | `a335f402b24a86afd4f905e258dcfa0afe955977fd528db1e363c8b46163c6e3` |
| company-email-templates-mobile | 12 | `3d4aa8e1539f24fee10d75d7bcd8291e2fcae888dc08ebff541cb4ff0c1a4f0b` |
| company-email-templates-mobile | 13 | `5f6075326c1d0c9347a0801899671cb0e839ead415360aa1fac095f2adb26c1d` |
| company-email-templates-mobile | 14 | `d1a123a663934fe7ed0c8e44b87e4acfe13d55094b5a947efd65f73ab481768d` |
| company-email-templates-mobile | 15 | `aaed8f6c9d9426c6042bbdb3d1d629e0a79c1365a5a67147547fbed445f269bb` |
