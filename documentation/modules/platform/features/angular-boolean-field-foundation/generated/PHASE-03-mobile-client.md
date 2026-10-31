<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Shared boolean field preparation Phase 03 - Expo Mobile Client

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

- **Shared boolean field preparation cross-platform master review:** `../modules/platform/features/angular-boolean-field-foundation/angular-boolean-field-foundation-review.md` sections 3, 4, 6, 7
- **Shared boolean field preparation Expo implementation profile:** `../modules/platform/features/angular-boolean-field-foundation/angular-boolean-field-foundation-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-boolean-field-foundation-master | 3 | `105b60ee32d8146a8c49038186ebcbcba664c350b443092de86eea58e627d6cd` |
| angular-boolean-field-foundation-master | 4 | `ae0580508cdef5d62a38c6a271bbffb458db6607d6b003aced9625a17c049670` |
| angular-boolean-field-foundation-master | 6 | `d7f6f4307682c796c94479735e56a02e4f6fccbdf46208212ffcd6a662adee54` |
| angular-boolean-field-foundation-master | 7 | `8ecd38d30820550d928c2e3d9492bb9b2381fb8cba02032eff3bb01bbfde46e0` |
| angular-boolean-field-foundation-mobile | 1 | `0ae423c021b74f3d4b4c4eccb231cbad9e834575b3123a543b419214a7199d4d` |
| angular-boolean-field-foundation-mobile | 2 | `7df39a32680faa803fac2f024cdd16a69c102b3185eb01cf3d3d437e907890ea` |
| angular-boolean-field-foundation-mobile | 3 | `105b60ee32d8146a8c49038186ebcbcba664c350b443092de86eea58e627d6cd` |
| angular-boolean-field-foundation-mobile | 4 | `ae0580508cdef5d62a38c6a271bbffb458db6607d6b003aced9625a17c049670` |
| angular-boolean-field-foundation-mobile | 5 | `3cd8929002b69dced37aadda0a53c2e47f73351a37ae9a936597ef2eb3798499` |
| angular-boolean-field-foundation-mobile | 6 | `d7f6f4307682c796c94479735e56a02e4f6fccbdf46208212ffcd6a662adee54` |
| angular-boolean-field-foundation-mobile | 7 | `8ecd38d30820550d928c2e3d9492bb9b2381fb8cba02032eff3bb01bbfde46e0` |
| angular-boolean-field-foundation-mobile | 8 | `653cc093d61e1ef12c7cebe2d2f0e0408d7c8eb7a561ba0993b8776d7a14b66b` |
| angular-boolean-field-foundation-mobile | 9 | `aeb73463a736e3afc44a5c8a0e4b87ec424d4cf94c519c925a73c44192ca73ed` |
| angular-boolean-field-foundation-mobile | 10 | `65025d0bddf1b98c587bd4cc2be53ffa24786df04ab9851b7f3666fa1c9d21d0` |
| angular-boolean-field-foundation-mobile | 11 | `a7500482bc0f7ba74d1dfaaaa201a2b834ef8d65330eec06b2b928a6b39933ff` |
| angular-boolean-field-foundation-mobile | 12 | `c8e140e7a3d9e643dd5a7af10a661fb28177db73db20ad06e98c1b2692ba3a5c` |
| angular-boolean-field-foundation-mobile | 13 | `d975f89d73aa5002720b88c1803beaff4fcd7debbea157646cdf01c938a97604` |
| angular-boolean-field-foundation-mobile | 14 | `71e44480a29b9a7882fe9afed7b83a097feb84f91e5c36bd2c4f4dc963914c6b` |
| angular-boolean-field-foundation-mobile | 15 | `6e78e61e77ecc4d9c79b57a7a26410c8041467221372b79d2b97c5269c55a798` |
