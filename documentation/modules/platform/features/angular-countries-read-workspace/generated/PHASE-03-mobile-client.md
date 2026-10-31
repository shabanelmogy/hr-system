<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Countries read workspace Phase 03 - Expo Mobile Client

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

- **Countries read workspace cross-platform master review:** `../modules/platform/features/angular-countries-read-workspace/angular-countries-read-workspace-review.md` sections 3, 4, 6, 7
- **Countries read workspace Expo implementation profile:** `../modules/platform/features/angular-countries-read-workspace/angular-countries-read-workspace-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-read-workspace-master | 3 | `900d99a68a5e3fb4b45f4d01d3278357a90c1bef05562b27edd672021635ebe6` |
| angular-countries-read-workspace-master | 4 | `73f5a7101a9e9f4423d8539c612013ba7eb1541d388fb44669919a8f2779bc62` |
| angular-countries-read-workspace-master | 6 | `4aa2e516e6ef412cfb58f2d8ccc71961358af0545fb78f9128ec63fdfa43b512` |
| angular-countries-read-workspace-master | 7 | `20af956b014674166cbc688b3813fff95ab1ed9a22bc27580172876834718601` |
| angular-countries-read-workspace-mobile | 1 | `b5f697f101f4ffcc3964a2bdf2f34aad6a9afdf2f2ef8e519d939ab62aab7b03` |
| angular-countries-read-workspace-mobile | 2 | `51f1e1d285b87461fffb80a80d433a26b836b3b254d99b2ede854d698aa9cc1e` |
| angular-countries-read-workspace-mobile | 3 | `900d99a68a5e3fb4b45f4d01d3278357a90c1bef05562b27edd672021635ebe6` |
| angular-countries-read-workspace-mobile | 4 | `73f5a7101a9e9f4423d8539c612013ba7eb1541d388fb44669919a8f2779bc62` |
| angular-countries-read-workspace-mobile | 5 | `3704acfa0146fdc1b48ca9f3465476082e5cce31454a7ab150b2149b60faf524` |
| angular-countries-read-workspace-mobile | 6 | `4aa2e516e6ef412cfb58f2d8ccc71961358af0545fb78f9128ec63fdfa43b512` |
| angular-countries-read-workspace-mobile | 7 | `20af956b014674166cbc688b3813fff95ab1ed9a22bc27580172876834718601` |
| angular-countries-read-workspace-mobile | 8 | `9c477e9921fce73d5b4db42fb8fd55aa1152683205584719fbec91024291702d` |
| angular-countries-read-workspace-mobile | 9 | `9956bd77de0553081068027e0cf412fb7f2ac7d411995786f17e1f2d5ddd6c6d` |
| angular-countries-read-workspace-mobile | 10 | `351549c64b8a2862ebda6e01484037ddf3730522101fa8d1379a763aceb43ac9` |
| angular-countries-read-workspace-mobile | 11 | `66b7842c53fe3f6e2ca4d73e4eb31426c01e65b6f00d8e86203decd1cb992e3f` |
| angular-countries-read-workspace-mobile | 12 | `1cc54745e63db3c14506da98e699afb0791a712984bb578523300f0d20e5fd06` |
| angular-countries-read-workspace-mobile | 13 | `a8e9fd7982be74fdc8e110741f94b12dc5c62d1d09f8ee17bb693688ff380700` |
| angular-countries-read-workspace-mobile | 14 | `69bab3d27082fe90f41a65d4b499af46527332ceeb501fc864030b62e433a43c` |
| angular-countries-read-workspace-mobile | 15 | `4233fa4c8da11c5f8abde54a33d133420fdeb7db0319db79f6e379c4f5acf39a` |
