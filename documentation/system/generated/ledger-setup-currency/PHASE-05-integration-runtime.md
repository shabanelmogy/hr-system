<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Ledger Setup Currency Phase 05 - Integration and Runtime

## Purpose

Prove the feature is connected to the running system, not merely implemented in isolated files.

## Integration matrix

Verify all applicable registrations:

- API endpoint versioning, authentication, tenant membership, permissions, dependency injection, validation scan, mapping scan, database context, localization, Hangfire, notification, and realtime.
- Web route, API proxy path, endpoint registry, route access, navigation, permissions, query keys, realtime query registry, translations, report route, and import dependencies.
- Mobile route file, typed route constant, route manifest, navigation, permissions, endpoint client, query keys, realtime registry, notification deep-link mapping, translations, report file handling, and device-safe layout.

## Runtime evidence

- [ ] API request and response samples match documented field names and paging metadata.
- [ ] Browser and mobile requests serialize the same shared filters and sort tokens.
- [ ] Every Required Import client sends the documented exact request body and
      resolves dependency lookups through an authorized registered endpoint.
- [ ] Import success uses the documented plural audit/notification/realtime action
      and refreshes normal feature caches; conflict and network paths remain retryable as specified.
- [ ] A successful mutation refreshes all open clients through their normal cache/realtime path.
- [ ] Notification action URLs land on authorized routes in both clients.
- [ ] Unauthorized, read-only, validation, not-found, conflict, and network failures render safely.
- [ ] Production build configuration does not rely on local-only URLs or secrets.
- [ ] Localization and RTL are tested in actual runtime layouts.

Capture configuration and registration evidence separately from behavior tests.
A file existing in the feature folder does not prove its route, DI, permission,
realtime, notification, localization, report, or Import integration is reachable.

## Approved references

- **Ledger Setup Currency cross-platform master review:** `../project/LEDGER_SETUP_CURRENCY_FEATURE_FULL_REVIEW.md` sections 4, 5, 6, 7, 9
- **Ledger Setup Currency API implementation profile:** `../api/LedgerSetupCurrency_API_Implementation_Profile.md` sections 8, 9, 10
- **Ledger Setup Currency Next.js implementation profile:** `../web-next/features/ledger-setup-currency-frontend-reference.md` sections 8, 10, 13
- **Ledger Setup Currency Expo implementation profile:** `../mobile-react/ledger-setup-currency-mobile-reference.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| ledger-setup-currency-master | 4 | `4ed34b720eff68b1e8efaa1b9a8901f2adf75224a463590905ce817d806a9b94` |
| ledger-setup-currency-master | 5 | `d30daac5a923d1fbef9759fa3d7cac9e707ee67b31fcc9f0d3bf50095ba78682` |
| ledger-setup-currency-master | 6 | `dbc146242b859fa8b147c7cb15b5c30e6a51b45d89c43fa7c08ee1df7b0d5e4a` |
| ledger-setup-currency-master | 7 | `e5857e4099341e28701b97b3b30a9b9301a3b61d5c5610c0d1032a500affffcd` |
| ledger-setup-currency-master | 9 | `dff971a02b19bad0a4703f8f710ac3f09c16d793869888005e9129b31f84eb01` |
| ledger-setup-currency-api | 8 | `5ec6bb7f5e6325a82fc9de425281748b0496fb12c7fd0ec132bd1c5047abebaf` |
| ledger-setup-currency-api | 9 | `12bf887a00d1c51b4c717b7615d0cc85b2f99796835dc8e357b93d26d60717cf` |
| ledger-setup-currency-api | 10 | `01bbb185825055c46bcab3251bc15df822bd15ca88bbef31094caa68e25bbbb5` |
| ledger-setup-currency-web | 8 | `b8685a30c64e3d84eeb814aea52a1c9b5998e0a6951c31134b17555cf552b76d` |
| ledger-setup-currency-web | 10 | `8611b677d13fbd51daea89e3bcc87e88fc1faa6e18d0beb364a63074b011a610` |
| ledger-setup-currency-web | 13 | `bec5dddf680765d4ec88fe5e57a2abcf83f2bc1621b8ae94a6353af85811b82f` |
| ledger-setup-currency-mobile | 2 | `2bc4e8c119b94d002e9aa6ae03b5f31d6d76e3bb60f11ada7371a9efa39b9ce2` |
| ledger-setup-currency-mobile | 11 | `43fe15fa62b9e410af74e249f4dcd3f52c62847c14b1ca7562d57c5e059ad442` |
| ledger-setup-currency-mobile | 12 | `2bed7ccbb9584f9254fe944009e219439fff9e96535fa7b527dc9da0149e84dd` |
| ledger-setup-currency-mobile | 15 | `25ded4e7261abd2a00f240ed30a4fed461ad82aa9c65da27ddeae8e2ecda2c79` |
