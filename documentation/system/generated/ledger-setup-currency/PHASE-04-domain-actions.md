<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Ledger Setup Currency Phase 04 - Domain Actions and Lifecycle

## Purpose

Reconcile every lifecycle action across API, browser, and mobile before considering the feature complete.

## Action ledger

For create, bulk create, edit, archive, restore, bulk archive, import, report, and child-management actions, record:

- Permission and read-only requirements.
- Eligible entity states and relationship guards.
- Confirmation and dirty-exit behavior.
- Request shape, normalization, validation, and maximum batch size.
- Transaction boundary, audit record, background job, notification, and realtime behavior.
- Shared concurrency resource/constraint for every dependency predicate, including
  all parent, child, restore, move, and bulk participants plus lock ordering.
- Cache invalidation and list-selection cleanup in both clients.
- Success, partial failure, all-or-nothing, idempotent, and retry outcomes.

## Exit checks

- [ ] UI visibility is not the only authorization boundary.
- [ ] Archived records cannot enter active-only flows.
- [ ] Restore behavior is explicit and tested.
- [ ] Bulk operations do not silently ignore invalid or duplicated identifiers.
- [ ] Client bulk selection cannot exceed the API maximum; oversized selection is
      rejected with feedback and the direct submit path rechecks it.
- [ ] Parent/child lifecycle races are tested or otherwise proven at the database
      boundary; isolated handler prechecks are not accepted as concurrency proof.
- [ ] Required Import distinguishes local-invalid rows from the submitted batch,
      states whether the submitted batch is atomic, and never reports partial
      success unless the API contract explicitly supports it.
- [ ] Import validates client limits before submitting and the API independently enforces its own limits.
- [ ] Import duplicate checks are field- and scope-specific, relationship lookups
      are explicit, retry behavior is safe, and any rejected-row download is
      separately classified as Required, Deferred, or Excluded.
- [ ] Client feedback uses stable server errors and localized fallback messages.

## Evidence to capture

For every action, record one row linking its direct client handler, permission
guard, API request, handler, transaction boundary, side-effect action, query-key
invalidation, success test, and failure test. Use `N/A` only with a reason.

## Approved references

- **Ledger Setup Currency cross-platform master review:** `../project/LEDGER_SETUP_CURRENCY_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7, 8
- **Ledger Setup Currency API implementation profile:** `../api/LedgerSetupCurrency_API_Implementation_Profile.md` sections 6, 7, 8
- **Ledger Setup Currency Next.js implementation profile:** `../web-next/features/ledger-setup-currency-frontend-reference.md` sections 6, 7, 8, 9
- **Ledger Setup Currency Expo implementation profile:** `../mobile-react/ledger-setup-currency-mobile-reference.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| ledger-setup-currency-master | 3 | `62b8150faf9422f607633c4841d52d5dc644a9a4c3502164e41572d650d6f9db` |
| ledger-setup-currency-master | 4 | `4ed34b720eff68b1e8efaa1b9a8901f2adf75224a463590905ce817d806a9b94` |
| ledger-setup-currency-master | 6 | `dbc146242b859fa8b147c7cb15b5c30e6a51b45d89c43fa7c08ee1df7b0d5e4a` |
| ledger-setup-currency-master | 7 | `e5857e4099341e28701b97b3b30a9b9301a3b61d5c5610c0d1032a500affffcd` |
| ledger-setup-currency-master | 8 | `f35d7dda56d7fc291b43bfae11ec6854a54f4c5fed49738b726458153311452d` |
| ledger-setup-currency-api | 6 | `51b2eaae1b7f4d980663df2cc3bf3fa4a4bf76c87bea22770639d84c8cfeb236` |
| ledger-setup-currency-api | 7 | `59076dbce64b783f44dd30df6da4b67e5d0c311fef94f5146637db0e3aef2e28` |
| ledger-setup-currency-api | 8 | `5ec6bb7f5e6325a82fc9de425281748b0496fb12c7fd0ec132bd1c5047abebaf` |
| ledger-setup-currency-web | 6 | `01187cfb787c420e216e186dea232734ac15d837de68d05d40e61499ecdf4023` |
| ledger-setup-currency-web | 7 | `a3275c603ecc7d3fd9914f7ee9dff1adba9ec4542f982287ff2b7a7cfaf2b2f3` |
| ledger-setup-currency-web | 8 | `b8685a30c64e3d84eeb814aea52a1c9b5998e0a6951c31134b17555cf552b76d` |
| ledger-setup-currency-web | 9 | `3ee3a65e046d7fe0cbcf33fe67439314c215990e079afd02fc332b1a1c9f9683` |
| ledger-setup-currency-mobile | 9 | `56c7d05b13d4c3b53eee5089b68c1267d3171083850809f7b4567d27debb29ac` |
| ledger-setup-currency-mobile | 10 | `c9e9b34da950792954ec7b47fe5837c82fa5ef0bd37a3beedf2e3dbcf4589bef` |
| ledger-setup-currency-mobile | 11 | `43fe15fa62b9e410af74e249f4dcd3f52c62847c14b1ca7562d57c5e059ad442` |
