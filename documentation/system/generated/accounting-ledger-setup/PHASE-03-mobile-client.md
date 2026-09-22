<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Accounting Ledger Setup Phase 03 - Expo Mobile Client

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

- **Accounting Ledger Setup cross-platform implementation contract:** `../project/ACCOUNTING_LEDGER_SETUP_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Accounting Ledger Setup Expo implementation contract:** `../mobile-react/accounting-ledger-setup-mobile-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| accounting-ledger-setup-master | 3 | `dca7efc3933fbfad21faec4412e0f5fbce8747b3881d5af2b14bb3210b1cbe45` |
| accounting-ledger-setup-master | 4 | `53f38a770f4b9c229d5f924b56a2be70be0db253054c0b998b0c21ec8c2ca0ca` |
| accounting-ledger-setup-master | 6 | `4c420eef9bb4f80999de2e4e4bebf23f4d9b3934746b134431e3cd97be170dbe` |
| accounting-ledger-setup-master | 7 | `530c84fc6ad3ba2299961c837d2bd3af3f2693292a7893dc1e27a7636b0c9290` |
| accounting-ledger-setup-mobile | 1 | `48c21f85cae0b04ee0edb50b7b58ea61964016dd2538667745daff7276556f58` |
| accounting-ledger-setup-mobile | 2 | `92c812138335162645a688002fce8b47d64842727e20706a330b1eef5c610dfb` |
| accounting-ledger-setup-mobile | 3 | `aa339ca38582f7c9ce37e0a942e649c4758d8c508696ff4477a5d32cddd266fc` |
| accounting-ledger-setup-mobile | 4 | `7aea79529fd4920a6256e25ac0b8c8842937b1686df1af29d67590dba460aac8` |
| accounting-ledger-setup-mobile | 5 | `716608f67856b81426aabce16eae8bd37d0cda93f21a1458e9ad00ba980e0e89` |
| accounting-ledger-setup-mobile | 6 | `8f3acc91847c8c79a5fcb6635e442f1128e189ecb6a9df34e82dc98fdd5fbdab` |
| accounting-ledger-setup-mobile | 7 | `00d827969d9ff0fb842be3730060a4c1857b1a62fd305804a65a21a56fec1e76` |
| accounting-ledger-setup-mobile | 8 | `924d56281d7fe1b4a41d16f9199c325ab69d51aab90a55594af7cd2dfe8c4cf1` |
| accounting-ledger-setup-mobile | 9 | `b38a5d0b193d3bd41831972e1709ff0a24f68ebc99b65f78546db8f34f28775e` |
| accounting-ledger-setup-mobile | 10 | `e90120b0c01c5eb55b901a74d4dcfcb6714449cbc5290a553cbf6a83054810b2` |
| accounting-ledger-setup-mobile | 11 | `63d74a38b34eeb8328687b1a744a9507b0a7524bfbb6fb42f63c07a3a96ddd36` |
| accounting-ledger-setup-mobile | 12 | `aac8b8ddd629c4b3f3dedbd1cc26947919d81e4d6574c009a04916ea805c23db` |
| accounting-ledger-setup-mobile | 13 | `458f9ae6e33c7b3d72542e57224f51c3936110b845ef5de05f1fea3f926b1235` |
| accounting-ledger-setup-mobile | 14 | `fa1a6a215ab292e596db868893998a319a541ebfdb8cf5bb79212d1990c639cc` |
| accounting-ledger-setup-mobile | 15 | `bf90a02cc0efd84b676907c5a05d0d311c1e7d41561635afe08363e1cefa84ef` |
