<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Countries archive and restore Phase 03 - Expo Mobile Client

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

- **Countries archive and restore cross-platform master review:** `../modules/platform/features/angular-countries-lifecycle/angular-countries-lifecycle-review.md` sections 3, 4, 6, 7
- **Countries archive and restore Expo implementation profile:** `../modules/platform/features/angular-countries-lifecycle/angular-countries-lifecycle-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-lifecycle-master | 3 | `2a99dc9056c58c3f8022a4321a6148bbdd7ba7a19f0dead110a8d7450cfded45` |
| angular-countries-lifecycle-master | 4 | `331e6637776a260b38003b52ffe9e21cabcf7f48d2e8ee51e8539660e2b2cb29` |
| angular-countries-lifecycle-master | 6 | `84b65d022d32811ad94d9c9aad2d0196243d75800b2f2de084df6be35b0ed3ae` |
| angular-countries-lifecycle-master | 7 | `f0727bca0b6c32ce6a15526681ae23f73eda6f0933f598b79a7d923d26a7d19b` |
| angular-countries-lifecycle-mobile | 1 | `1f1370064af30c953d980a7e69c15ba75d9088091a66b6e34fdaf78566ce6eef` |
| angular-countries-lifecycle-mobile | 2 | `4c7f0a13faaa13c5147c36f77a58550184056382bce2484b8842994b48755165` |
| angular-countries-lifecycle-mobile | 3 | `2a99dc9056c58c3f8022a4321a6148bbdd7ba7a19f0dead110a8d7450cfded45` |
| angular-countries-lifecycle-mobile | 4 | `331e6637776a260b38003b52ffe9e21cabcf7f48d2e8ee51e8539660e2b2cb29` |
| angular-countries-lifecycle-mobile | 5 | `60080ac65c3480367b6aed2361faf4a2878f724fd85c98679ed4498e919e259a` |
| angular-countries-lifecycle-mobile | 6 | `84b65d022d32811ad94d9c9aad2d0196243d75800b2f2de084df6be35b0ed3ae` |
| angular-countries-lifecycle-mobile | 7 | `f0727bca0b6c32ce6a15526681ae23f73eda6f0933f598b79a7d923d26a7d19b` |
| angular-countries-lifecycle-mobile | 8 | `666370365740a43f1c958be3f6068e9349259450ddceb922cbd87521a825c607` |
| angular-countries-lifecycle-mobile | 9 | `6c08316e9011bf4af0c9b35261ef93ed45b66954d59e93cb192ca8c5eb69b5ad` |
| angular-countries-lifecycle-mobile | 10 | `030e42cb4a42c82430ec2e0580076939f542a4db8345e80c239a8642c4c931e4` |
| angular-countries-lifecycle-mobile | 11 | `a3598268a0d4ef491b466389ab4f513512d9f78be03e1f5ca8a9fb22f1e29cc5` |
| angular-countries-lifecycle-mobile | 12 | `0e461e50d4b0d2ce1882e2d6208dedad460f8b49c27253e31a39a7dc66a5ec10` |
| angular-countries-lifecycle-mobile | 13 | `19949119c8350ef9264aa1f47cfe68e3b3c964cba3b88e8c7aedc2c4f0c80e29` |
| angular-countries-lifecycle-mobile | 14 | `1290c411947da0be85db525c3a06a0b7dae44d880c05c5854452989c14576816` |
| angular-countries-lifecycle-mobile | 15 | `587fa35315ffba9fcaead1269c1f153206e418e3d3d5534ae6fc03a228eba3c7` |
