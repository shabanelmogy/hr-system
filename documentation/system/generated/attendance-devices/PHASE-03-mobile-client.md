<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Attendance Devices Phase 03 - Expo Mobile Client (deferred)

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

- **Attendance Devices cross-platform master review:** `../project/ATTENDANCE_DEVICES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Attendance Devices Expo implementation profile (deferred):** `../mobile-react/attendance-devices-mobile-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| attendance-devices-master | 3 | `c6619586b58ca9eca3be36bb6d10bb72d97f3cdb67b4f49ebca55e90bc29ca5c` |
| attendance-devices-master | 4 | `883d12a168ad1f5a7d103912e0541748d3d3a692be6eea2417865a39f5e2ea18` |
| attendance-devices-master | 6 | `d4d02053ca38139b5ea51928c18352d2ad86e08b3b1308b3d3fa58fab55db761` |
| attendance-devices-master | 7 | `433b3f83669c1abbc1d39bf7fc3c8bcf8b759e1311566bfeb4e0f5c248b302ec` |
| attendance-devices-mobile | 1 | `e4e99690aefc68e7b12dc0fd1f11d51b194d06c0e6448f9d3f2a37a289d1ffac` |
| attendance-devices-mobile | 2 | `14455a3b23dee24861cb73b6c36f0f2be23653a00d9c81f2c5827c0bcb6835d1` |
| attendance-devices-mobile | 3 | `1e45740ec57d1c888ae437d6a1dec2fbed900e59022f15aa016c6d2c9ca871db` |
| attendance-devices-mobile | 4 | `8824d7b84880975fe0675779e3c1de68fe9b1e957b39cc01a7ab6132fd6b9209` |
| attendance-devices-mobile | 5 | `b532e5e00fb4121b492a70aac000cb8029503c0b3eebe33158baff5ffa25d100` |
| attendance-devices-mobile | 6 | `0a1b27e53e8a104a3889a36e8f0d2bb9d2abd60c78e7b895082ed9efb1a0160a` |
| attendance-devices-mobile | 7 | `e1b98604dc7b409e96de0c8f793930aa402115f229288b04af7a7686d0fc11eb` |
| attendance-devices-mobile | 8 | `87218557dd9c64a40bfa1b478189623bad412268f06af6e969bc06b8e28d8a00` |
| attendance-devices-mobile | 9 | `7b8d0a6ebd857babfc8e6c9ed85367b8ae7f7a581bc4638af565ac031feecda6` |
| attendance-devices-mobile | 10 | `bb4cfc74f64a4408794dd3ea9eb58c4faa8bd828100cf90e9a6943661b9a8b31` |
| attendance-devices-mobile | 11 | `f6e3af50cabec47f4411d301618509d22c795267a86a53bd1dfdf111edba5da4` |
| attendance-devices-mobile | 12 | `aa84e3d7d989e7208f9f8156901ce3a77743aa2dbb9fcc15aaa0a8854f904b2b` |
| attendance-devices-mobile | 13 | `09eea78836910ab7635aa41b1058f05d38146ea2ab6b96a5209af96a172c5598` |
| attendance-devices-mobile | 14 | `bf81e5505378e7fe18329aa7eb5595718b7d0942998e64cacb471df3fc3f49ba` |
| attendance-devices-mobile | 15 | `eefc51f54f37fd552cb52fbb4be11b6e3757b79ecc18ee399ac8d2d409756a6f` |
