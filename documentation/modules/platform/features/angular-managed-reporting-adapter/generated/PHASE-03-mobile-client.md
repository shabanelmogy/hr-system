<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Managed reporting adapter preparation Phase 03 - Expo Mobile Client

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

- **Managed reporting adapter preparation cross-platform master review:** `../modules/platform/features/angular-managed-reporting-adapter/angular-managed-reporting-adapter-review.md` sections 3, 4, 6, 7
- **Managed reporting adapter preparation Expo implementation profile:** `../modules/platform/features/angular-managed-reporting-adapter/angular-managed-reporting-adapter-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-managed-reporting-adapter-master | 3 | `0a8d888ba28cd7d35ccaaf15d92162d047c48a3482e973322396688b5d08e520` |
| angular-managed-reporting-adapter-master | 4 | `0d75a0cc98ed3a106e8343d19526c34b38a8aa4ce019633d33510a6df070b725` |
| angular-managed-reporting-adapter-master | 6 | `7ddf91640d39b54272167893efb83e1111050dce8b98d44d9b1a94e99b53523f` |
| angular-managed-reporting-adapter-master | 7 | `6cef15e087ca9135e2e920cff1c04ee79be87ad22f23806e486bd03344b31515` |
| angular-managed-reporting-adapter-mobile | 1 | `700d6af9c12803135af2dc8f08b8123b1a97dc3ffde723af1b3995a8004092a3` |
| angular-managed-reporting-adapter-mobile | 2 | `bfad8afecaea948e75f03de736c5379d100b426827cb85889e5f14898235baae` |
| angular-managed-reporting-adapter-mobile | 3 | `0a8d888ba28cd7d35ccaaf15d92162d047c48a3482e973322396688b5d08e520` |
| angular-managed-reporting-adapter-mobile | 4 | `0d75a0cc98ed3a106e8343d19526c34b38a8aa4ce019633d33510a6df070b725` |
| angular-managed-reporting-adapter-mobile | 5 | `6241b5fb0db88e111491eed08e0dcb92e8386fe3b26867510d4cd5f29f7d3d2b` |
| angular-managed-reporting-adapter-mobile | 6 | `7ddf91640d39b54272167893efb83e1111050dce8b98d44d9b1a94e99b53523f` |
| angular-managed-reporting-adapter-mobile | 7 | `6cef15e087ca9135e2e920cff1c04ee79be87ad22f23806e486bd03344b31515` |
| angular-managed-reporting-adapter-mobile | 8 | `ccd65bd62ffc69968dd25b5533dce7903889333438951fd55ff4f1fcf34a15a4` |
| angular-managed-reporting-adapter-mobile | 9 | `134f6c9e94fe56442f0bda990b5c3b4f33cdaf72115b8973b40c9ebec4fc79fa` |
| angular-managed-reporting-adapter-mobile | 10 | `36f180ef4c51ad92659ec0c8848c07e2636ccbb9bb6c3b1f12d982b41b09d353` |
| angular-managed-reporting-adapter-mobile | 11 | `93a24091f3b77bb5313d74a69e82a8bf121d35d9a343c8278f1ff6ba6c4715ad` |
| angular-managed-reporting-adapter-mobile | 12 | `f1a8ba2d63f73fe51ffa57f075322ec2a4b498d29271bc027422f993541bbdda` |
| angular-managed-reporting-adapter-mobile | 13 | `8a83e45d2d2ea70f6e4e9f34106b8ce0f8347ca89327a8b1c7a85bd7eab05d39` |
| angular-managed-reporting-adapter-mobile | 14 | `8b5301fd892df0cfd9a06d653ba6e2b0a955b5093b7e5f480ed32f1644684847` |
| angular-managed-reporting-adapter-mobile | 15 | `6b4f9dac35863f1038ce7d76086bddc0e118956ed9b494644efecc95b5df8065` |
