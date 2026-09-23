<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Accounting Chart of Accounts and Hierarchy Phase 03 - Expo Mobile Client

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

- **Accounting Chart of Accounts and Hierarchy cross-platform implementation contract:** `../project/LEDGER_SETUP_COA_HIERARCHY_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Accounting Chart of Accounts and Hierarchy Expo implementation contract:** `../mobile-react/ledger-setup-coa-hierarchy-mobile-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| ledger-setup-coa-hierarchy-master | 3 | `506261bc57d418b35b861e895202f0d0e002e76580f31b6bc221fcdf725417e3` |
| ledger-setup-coa-hierarchy-master | 4 | `d98c472a1497ad2d7f2e5d96839ed1a1c7fec16d3f6f3c1a45fd083f190be6d8` |
| ledger-setup-coa-hierarchy-master | 6 | `aa868978610f3e8a3aa72060935719cf3f657c796f10359642b45cc0c244edc5` |
| ledger-setup-coa-hierarchy-master | 7 | `289dae9e3e135bc59698fc02c8dfdbe8088e38c13624adb5c124290e507f252d` |
| ledger-setup-coa-hierarchy-mobile | 1 | `c3397104f08d453c1a565901a271d0f087651fd7a389c4343cf6310b35408853` |
| ledger-setup-coa-hierarchy-mobile | 2 | `f21cabc1f28ee6a65d578c6b5cfdd2d6a023c6a4497c15eaf868f173fbf87e07` |
| ledger-setup-coa-hierarchy-mobile | 3 | `b1abeef89105a0242a82d9c47bd5b38732b0338064feec35c45280b8c279be8a` |
| ledger-setup-coa-hierarchy-mobile | 4 | `95e0aef6b4670617027ba6250faf414c2c43c9f6798c9635fe842a31717b62b7` |
| ledger-setup-coa-hierarchy-mobile | 5 | `363e5c808f459ed6bf260e94a580bd7ff2138d0d72858da17e943ba64e63c75b` |
| ledger-setup-coa-hierarchy-mobile | 6 | `425d182ff6a486a99f3abece4729b069b3fca749ac0d2d5550287ad081db4bc5` |
| ledger-setup-coa-hierarchy-mobile | 7 | `3c2260f2f29381282f76fa706fd82e739b5753e718a2209a71330e9bde2e084c` |
| ledger-setup-coa-hierarchy-mobile | 8 | `dc6151198117f7e05d1f01164c566c8be7e207093a4d766d97e9c354f7b88640` |
| ledger-setup-coa-hierarchy-mobile | 9 | `b41990b5ac6d76b1d2f5bab04effd08b886afb7bc93e945b2bc9dec5ae4144f8` |
| ledger-setup-coa-hierarchy-mobile | 10 | `6c0dd27cf4e3a456030fc11b4d77a976d295c3e2a999d5a91a0d21714bf8dbf0` |
| ledger-setup-coa-hierarchy-mobile | 11 | `caa58263a99e472c4a77664492d5fc21590c70ea93e0311cbe2c827cee848c2b` |
| ledger-setup-coa-hierarchy-mobile | 12 | `dc50a9ab0032d4816fa63a289f7bcefef05a63fc7f1a09b1c14527959ae7fb36` |
| ledger-setup-coa-hierarchy-mobile | 13 | `8a2d8ed1e88da8faba3b14c4f8364b8e5c9e863afa10bdc34630b4208728987a` |
| ledger-setup-coa-hierarchy-mobile | 14 | `55c8ee742ffb67d5dc71bf45816276eef1ea72dc077d2c36739361509108a89d` |
| ledger-setup-coa-hierarchy-mobile | 15 | `fd777f1160cb0a2076ea34e551efeb53102377cff6225cf39f19dc9037f4fe3f` |
