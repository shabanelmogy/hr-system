<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# States complete Angular parity Phase 03 - Expo Mobile Client

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

- **States complete Angular parity cross-platform master review:** `../modules/platform/features/angular-states-workspace/angular-states-workspace-review.md` sections 3, 4, 6, 7
- **States complete Angular parity Expo implementation profile:** `../modules/platform/features/angular-states-workspace/angular-states-workspace-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-states-workspace-master | 3 | `ac8493dff376e3675b110f0c643799f1d399b3d40516092c4e7b6392278b5bc8` |
| angular-states-workspace-master | 4 | `337cd6781195f95a821c1ce670cfe9c86930d82007f1e1152f2b9855e12cefd1` |
| angular-states-workspace-master | 6 | `f1fa81a7964badb1ca8ccf5e92bac1822e68362601b9fc3708f45b3048f97f5b` |
| angular-states-workspace-master | 7 | `501a10a08c373e454ebac69f367245279aecf89c8a2b9c44928c8a67c720c492` |
| angular-states-workspace-mobile | 1 | `8e70cdaf13d3c0d7c05cb504b4296eee33b100ef636a040fd4520d6585e068fc` |
| angular-states-workspace-mobile | 2 | `36d44963ed8890b4bd9a92d54e4dad1a83c150ac561160dc51e0d4a288791a31` |
| angular-states-workspace-mobile | 3 | `ac8493dff376e3675b110f0c643799f1d399b3d40516092c4e7b6392278b5bc8` |
| angular-states-workspace-mobile | 4 | `337cd6781195f95a821c1ce670cfe9c86930d82007f1e1152f2b9855e12cefd1` |
| angular-states-workspace-mobile | 5 | `658b5a249ccf0aab79700f4874f371d4aff3484f7b02ffbdaf51459bddf7b503` |
| angular-states-workspace-mobile | 6 | `f1fa81a7964badb1ca8ccf5e92bac1822e68362601b9fc3708f45b3048f97f5b` |
| angular-states-workspace-mobile | 7 | `7584691b6644143db3b466beaf52ff38ce7802770143b488a1cf4cc9ed53251b` |
| angular-states-workspace-mobile | 8 | `a2711720a0f2987543734da15a69eb1eb2596157145afa8a1fc4e852ea8d6ab5` |
| angular-states-workspace-mobile | 9 | `a300cf55dc219cefbfc033db706b12fccb640c2805d7cd8e010ccea1c298a2bb` |
| angular-states-workspace-mobile | 10 | `cfcb30676c9971033e8d24fc22f39d3237f9e9670bb15aaf3a663f2063d751ad` |
| angular-states-workspace-mobile | 11 | `98b658eb4d1191f2dac57864eb9a8bc49d409da4227e35893994fddfc9f71d45` |
| angular-states-workspace-mobile | 12 | `b0ce98265d69ab51f50b51a1ebadab90756bb2d9c76733366e7e6ed8005a80e8` |
| angular-states-workspace-mobile | 13 | `b71d7912db56b4c105ebcb0adc758cdcde8b72a4d9845d43e9fbc9f75f1ad260` |
| angular-states-workspace-mobile | 14 | `a1730524d70f99dcf826b8becb48de231bbcfe3c65511e73664fcc17627b587c` |
| angular-states-workspace-mobile | 15 | `857d073781337124f17a26cd4e96384186fe06ac15e2f6b485c160ebd606beb0` |
