<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Complete shared PrimeNG Table capabilities Phase 03 - Expo Mobile Client

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

- **Complete shared PrimeNG Table capabilities cross-platform master review:** `../modules/platform/features/angular-grid-capabilities/angular-grid-capabilities-review.md` sections 3, 4, 6, 7
- **Complete shared PrimeNG Table capabilities Expo implementation profile:** `../modules/platform/features/angular-grid-capabilities/angular-grid-capabilities-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-grid-capabilities-master | 3 | `5a2ce7d223a49e94cc59cfde9889cc25cfa4c0aacbd21d7920fc2ba41e005af7` |
| angular-grid-capabilities-master | 4 | `04a49d8f05ff7846a82b8487639c09b8b3d4a1fefd25bd89f94e13497629268f` |
| angular-grid-capabilities-master | 6 | `dfcf9a6a661c765951ed8291e2d008a301fc7ffe081796f0ff0a8039eb11d9ef` |
| angular-grid-capabilities-master | 7 | `8cf28db5889c5e4cdbaf893c3bc712b096c49a27df338bc71a4a2744ccd5def6` |
| angular-grid-capabilities-mobile | 1 | `f79cdcbdb88f39547cdb85ed96fb7e5509a4787d0720962d402601f5da4fc8ee` |
| angular-grid-capabilities-mobile | 2 | `69ef1b7a3274521368a20c0d398fd2b62edf04537bac39cee66099cccbac9eb6` |
| angular-grid-capabilities-mobile | 3 | `5a2ce7d223a49e94cc59cfde9889cc25cfa4c0aacbd21d7920fc2ba41e005af7` |
| angular-grid-capabilities-mobile | 4 | `04a49d8f05ff7846a82b8487639c09b8b3d4a1fefd25bd89f94e13497629268f` |
| angular-grid-capabilities-mobile | 5 | `3472f547a2548a8a7dc7cf1a9793c19fe2af31f527680c4bf79cddde0fe01e8a` |
| angular-grid-capabilities-mobile | 6 | `dfcf9a6a661c765951ed8291e2d008a301fc7ffe081796f0ff0a8039eb11d9ef` |
| angular-grid-capabilities-mobile | 7 | `8cf28db5889c5e4cdbaf893c3bc712b096c49a27df338bc71a4a2744ccd5def6` |
| angular-grid-capabilities-mobile | 8 | `1a88531afb53989d42a83368fed092db8cdb99fbb3802aad2dcee8d02f9c023a` |
| angular-grid-capabilities-mobile | 9 | `a1489c8330bd0c141667b8f5fa1740f2a3633e7102ab4687734ec2bf7725f178` |
| angular-grid-capabilities-mobile | 10 | `c0b63473188ac0d8bdf814240acb1887e8ec1b3b0b2a7ab8775bc40215b23d09` |
| angular-grid-capabilities-mobile | 11 | `c1ac27d24dc880a8c201595afe249db3a460bf6e78cfab9fb950431f422d680d` |
| angular-grid-capabilities-mobile | 12 | `9df3455d6570e40575058a4d70a528cf4753094da862e7a76ce400c14db5f135` |
| angular-grid-capabilities-mobile | 13 | `a946e454093eb7a23819b4e291046f565fd1cd09dbc8916a3a484e6b2f1bb4c0` |
| angular-grid-capabilities-mobile | 14 | `8057071de15d9c55856a5b390cb1035d4c9938745599fb11dd6d862c574925c1` |
| angular-grid-capabilities-mobile | 15 | `2b9cd282459fbfcf5f93b5806a4f7f33e285118413b510e94f95555d92c506ce` |
