<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Ledger Setup Currency Phase 03 - Expo Mobile Client

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

- **Ledger Setup Currency cross-platform master review:** `../project/LEDGER_SETUP_CURRENCY_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Ledger Setup Currency Expo implementation profile:** `../mobile-react/ledger-setup-currency-mobile-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| ledger-setup-currency-master | 3 | `62b8150faf9422f607633c4841d52d5dc644a9a4c3502164e41572d650d6f9db` |
| ledger-setup-currency-master | 4 | `4ed34b720eff68b1e8efaa1b9a8901f2adf75224a463590905ce817d806a9b94` |
| ledger-setup-currency-master | 6 | `dbc146242b859fa8b147c7cb15b5c30e6a51b45d89c43fa7c08ee1df7b0d5e4a` |
| ledger-setup-currency-master | 7 | `e5857e4099341e28701b97b3b30a9b9301a3b61d5c5610c0d1032a500affffcd` |
| ledger-setup-currency-mobile | 1 | `e3e2be711c26e4e2bb5bddbfc4c3009724a9ccd15c5323e41c0ecfde5af1fe79` |
| ledger-setup-currency-mobile | 2 | `2bc4e8c119b94d002e9aa6ae03b5f31d6d76e3bb60f11ada7371a9efa39b9ce2` |
| ledger-setup-currency-mobile | 3 | `1df1220d4c547a3a231f5059eda66344602e613f2f1107d190d06bc29f21dbeb` |
| ledger-setup-currency-mobile | 4 | `adc55449cf2e4dc759fa1791a72b58365212feca0da68d11efc34338adef097d` |
| ledger-setup-currency-mobile | 5 | `4efbc1d2af4001708708aac0d972dca8364e041d2b69231835f8527df58d283e` |
| ledger-setup-currency-mobile | 6 | `12104c3e63a2d8558eae0fa7482f0c15423af09b0ed56dd23f3c4fb7981d4b60` |
| ledger-setup-currency-mobile | 7 | `fd12dd4bbba7790a84ae5ffbfe3360aa9f3dbaba276524f5b9b9b9fb75d09d35` |
| ledger-setup-currency-mobile | 8 | `971d2f8c22f56bf7b51ea2e7ae111ba9c44ff8ac4b2bd136830b3ebb3b6d725a` |
| ledger-setup-currency-mobile | 9 | `56c7d05b13d4c3b53eee5089b68c1267d3171083850809f7b4567d27debb29ac` |
| ledger-setup-currency-mobile | 10 | `c9e9b34da950792954ec7b47fe5837c82fa5ef0bd37a3beedf2e3dbcf4589bef` |
| ledger-setup-currency-mobile | 11 | `43fe15fa62b9e410af74e249f4dcd3f52c62847c14b1ca7562d57c5e059ad442` |
| ledger-setup-currency-mobile | 12 | `2bed7ccbb9584f9254fe944009e219439fff9e96535fa7b527dc9da0149e84dd` |
| ledger-setup-currency-mobile | 13 | `fdca628b38ab568dd6bab8eebcdedc7deed682294400e071563808e493c869c1` |
| ledger-setup-currency-mobile | 14 | `7d054bc8fcb0992efe55f564a9e6e952ff596976745603fcf6d591c9c04a29ab` |
| ledger-setup-currency-mobile | 15 | `25ded4e7261abd2a00f240ed30a4fed461ad82aa9c65da27ddeae8e2ecda2c79` |
