<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Super Admin Tenant Administrators parity Phase 03 - Expo Mobile Client

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

- **Super Admin Tenant Administrators parity cross-platform master review:** `../modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-review.md` sections 3, 4, 6, 7
- **Super Admin Tenant Administrators parity Expo implementation profile:** `../modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-tenant-admins-workspace-master | 3 | `cb02ff3daf5730e7aa4f8f626540354ce6d3535dc626424c37dda120a2e7a7be` |
| angular-tenant-admins-workspace-master | 4 | `b312109aea85caea32a57fdcec24284fbf6883425ce0a13e933303f35fe09339` |
| angular-tenant-admins-workspace-master | 6 | `9d15f52db14b58a5e479be4391307c4b6c02b878731e5c7db257054d35ec6378` |
| angular-tenant-admins-workspace-master | 7 | `2c923981c40da00473fa4db151327a1323a4a1cfd247879bb0ea9b8f7815b15c` |
| angular-tenant-admins-workspace-mobile | 1 | `059b48fa0b389f7a89dd01463313ba0c1db2772d2b10defb8630096f571c0ee8` |
| angular-tenant-admins-workspace-mobile | 2 | `99920dbd79c8c9d191ef7c37a64abf24af13da54217b04b7dfd0328f44590f86` |
| angular-tenant-admins-workspace-mobile | 3 | `cb02ff3daf5730e7aa4f8f626540354ce6d3535dc626424c37dda120a2e7a7be` |
| angular-tenant-admins-workspace-mobile | 4 | `b312109aea85caea32a57fdcec24284fbf6883425ce0a13e933303f35fe09339` |
| angular-tenant-admins-workspace-mobile | 5 | `d8074733d2bac92b22c630159b7a1315c740055c352ba47cff6d799d9fe7e9a0` |
| angular-tenant-admins-workspace-mobile | 6 | `9d15f52db14b58a5e479be4391307c4b6c02b878731e5c7db257054d35ec6378` |
| angular-tenant-admins-workspace-mobile | 7 | `2c923981c40da00473fa4db151327a1323a4a1cfd247879bb0ea9b8f7815b15c` |
| angular-tenant-admins-workspace-mobile | 8 | `1e18636edbe60a282f77f2ab441b85f2359c9ea6051fabca7360c592e925719f` |
| angular-tenant-admins-workspace-mobile | 9 | `9fc33d645ccd7ddc8a3900ab3265c732e553c5894ab8e2219f201cfe91081800` |
| angular-tenant-admins-workspace-mobile | 10 | `9d9e0e66e19ccb5487a50d725ad157fc49323d97f3e1bc6fd76370ffb0429bb3` |
| angular-tenant-admins-workspace-mobile | 11 | `3184a5fcf173d6e35813758be2a5dac2f5597db2363e9d87eb85cd51d2da6fb3` |
| angular-tenant-admins-workspace-mobile | 12 | `5aa0ce96abf130008a81a0ba63b07ef8c7fadb966cd3d8a16b285f45d2b5edb8` |
| angular-tenant-admins-workspace-mobile | 13 | `2326725837a66e7d8ef635069758f4f59db053ad4033da25ee4a5e5bc857537e` |
| angular-tenant-admins-workspace-mobile | 14 | `601548b18d59a0599c14e05d8255325957e1adfce88f89a67a0605b2cbbb53ad` |
| angular-tenant-admins-workspace-mobile | 15 | `2b121f7823c8ea50c39cd05102a4b50a2f1a4ccf5fec49b34d130a3c89c56772` |
