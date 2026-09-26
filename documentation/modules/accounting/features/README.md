# Accounting feature catalog

This catalog separates runtime source evidence from current execution authority.
The canonical order/status for Ledger Setup is
[`accounting-core-gl/SLICE-01-LEDGER-SETUP-EXECUTION.md`](../../../plans/business/accounting-core-gl/SLICE-01-LEDGER-SETUP-EXECUTION.md);
only its `ACTIVE_FEATURE_STEP` may be worked as the current feature.

| Feature | Evidence status | Canonical plan/profile |
| --- | --- | --- |
| Fiscal Years & Periods | Implemented typed API/Web/Mobile; active current live revalidation | `documentation/plans/business/accounting-core-gl/decomposition/fiscal-years.md` |
| Accounting Currency | Implemented typed API/Web/Mobile with historical Phase 07 evidence; queued for current v2 revalidation | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-currency.md` |
| COA & Hierarchy Levels | Domain/API and typed Web/Mobile source through Phase 03; integrated live/database/closure pending | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-coa-hierarchy.md` |
| Dimensions | Domain/API plus reachable generic compatibility clients; typed P-001/P-006 child is Planned | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-dimensions.md` |
| Books & Journal Definitions | Domain/API plus reachable generic compatibility clients; typed P-001 children are Planned | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-books-journals.md` |
| Accounting Company Settings | Domain/API plus current singleton compatibility journey; typed P-005 child is Planned | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-company-settings.md` |
| Exchange Rate Types & Rates | Domain/API plus reachable generic compatibility clients; typed P-001 children are Planned | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-exchange-rates.md` |
| Link Accounts | Domain/API plus generic compatibility client; typed capability-driven P-006 child is Planned | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-link-accounts.md` |
| Posting Profiles & Resolve Preview | Domain/API plus generic compatibility client/preview; typed P-001 child and structured preview are Planned | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-posting-profiles.md` |
| Ledger Setup Integration | P-007 Web/Mobile overview sources exist; final cross-child verification is Planned | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-integration-verification.md` |

Every named master in these children carries separate Arabic/English business
values. The current v2 contracts require `NameAr` and `NameEn` through API,
Web/Mobile create/edit/view/list and mock-draft evidence; records without an authored
name display localized referenced-owner names and do not invent name columns.

Later Planned areas are GL/journals/posting, AP, AR, cash/bank, tax, fixed assets,
approved external-fact integration, and close/reporting/audit. Keep each area
clearly marked Planned or Deferred until source evidence and its plan gates exist.

Cross-module flows must use Contracts/events and stable IDs. Do not add a
feature entry that implies a direct EF relationship to any other module. Use
[`../../../system/README.md`](../../../system/README.md) for shared phase recipes
and generated packets; never copy those rules into this catalog.

The ordered implementation scope and phase-level acceptance criteria live in
[`../phases/README.md`](../phases/README.md). Link feature entries to the phase
that owns them rather than duplicating its common rules.
