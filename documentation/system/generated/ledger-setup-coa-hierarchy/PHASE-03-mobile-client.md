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
| ledger-setup-coa-hierarchy-master | 3 | `492db78014ebbec06f6ea5efcb4834728e7e716f07de1a65b7a8ef54c48f5d96` |
| ledger-setup-coa-hierarchy-master | 4 | `d98c472a1497ad2d7f2e5d96839ed1a1c7fec16d3f6f3c1a45fd083f190be6d8` |
| ledger-setup-coa-hierarchy-master | 6 | `0d7dd56699efbb0a91fb1cd3b332bb99aef11aa207c01f444594a47914561f5b` |
| ledger-setup-coa-hierarchy-master | 7 | `7a06d80a788ca9f33ed3c3651f664ddddeade75ccfbc008979ae5eaf90d72150` |
| ledger-setup-coa-hierarchy-mobile | 1 | `b8f1766431871a99355100a8ef8b56b160205a65540b1f9fc3263e768b8a2f06` |
| ledger-setup-coa-hierarchy-mobile | 2 | `f21cabc1f28ee6a65d578c6b5cfdd2d6a023c6a4497c15eaf868f173fbf87e07` |
| ledger-setup-coa-hierarchy-mobile | 3 | `b1abeef89105a0242a82d9c47bd5b38732b0338064feec35c45280b8c279be8a` |
| ledger-setup-coa-hierarchy-mobile | 4 | `95e0aef6b4670617027ba6250faf414c2c43c9f6798c9635fe842a31717b62b7` |
| ledger-setup-coa-hierarchy-mobile | 5 | `038fa2168d5c4e39bf55d8f147723c8c7b923f53c6c7e20c57bb756b7cc1fcda` |
| ledger-setup-coa-hierarchy-mobile | 6 | `425d182ff6a486a99f3abece4729b069b3fca749ac0d2d5550287ad081db4bc5` |
| ledger-setup-coa-hierarchy-mobile | 7 | `3c2260f2f29381282f76fa706fd82e739b5753e718a2209a71330e9bde2e084c` |
| ledger-setup-coa-hierarchy-mobile | 8 | `dc6151198117f7e05d1f01164c566c8be7e207093a4d766d97e9c354f7b88640` |
| ledger-setup-coa-hierarchy-mobile | 9 | `bdaff3639647798241ca62e4075b00f97228e02a634adf5f061a4d57ad0cee53` |
| ledger-setup-coa-hierarchy-mobile | 10 | `dc9df5b0cb83c6ce8750b5bad42cfb9cb855023f0e4911db1894f6ae1b4dbe9a` |
| ledger-setup-coa-hierarchy-mobile | 11 | `caa58263a99e472c4a77664492d5fc21590c70ea93e0311cbe2c827cee848c2b` |
| ledger-setup-coa-hierarchy-mobile | 12 | `dc50a9ab0032d4816fa63a289f7bcefef05a63fc7f1a09b1c14527959ae7fb36` |
| ledger-setup-coa-hierarchy-mobile | 13 | `8a2d8ed1e88da8faba3b14c4f8364b8e5c9e863afa10bdc34630b4208728987a` |
| ledger-setup-coa-hierarchy-mobile | 14 | `f3ef28aeabcfd9de709dc4e97d93bd46c03ddb50a578c220773d7d9ad2039e59` |
| ledger-setup-coa-hierarchy-mobile | 15 | `fd777f1160cb0a2076ea34e551efeb53102377cff6225cf39f19dc9037f4fe3f` |
