# Accounting feature catalog

This catalog separates runtime source evidence from current execution authority.
The canonical order/status for Ledger Setup is
[`accounting-core-gl/SLICE-01-LEDGER-SETUP-EXECUTION.md`](../../../plans/business/accounting-core-gl/SLICE-01-LEDGER-SETUP-EXECUTION.md);
only its `ACTIVE_FEATURE_STEP` may be worked as the current feature.

| Feature | Evidence status | Canonical plan/profile |
| --- | --- | --- |
| Fiscal Years & Periods | Implemented typed API/Web/Mobile; active current live revalidation | `documentation/plans/business/accounting-core-gl/decomposition/fiscal-years.md` · [review](fiscal-years/fiscal-years-review.md) |
| Accounting Currency | Implemented typed API/Web/Mobile with historical Phase 07 evidence; queued for current v2 revalidation | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-currency.md` · [customer guide](../../../plans/business/accounting-core-gl/education/ledger-setup-currency.md) |
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

## Feature folders

Every file of a feature lives in its folder. Generated phase packets are
never edited by hand.

| Feature | Files |
| --- | --- |
| `accounting-ledger-setup` | [Review](accounting-ledger-setup/accounting-ledger-setup-review.md) · [API](accounting-ledger-setup/accounting-ledger-setup-api.md) · [Web](accounting-ledger-setup/accounting-ledger-setup-web.md) · [Mobile](accounting-ledger-setup/accounting-ledger-setup-mobile.md) · [Request](accounting-ledger-setup/accounting-ledger-setup-request.md) · [Evidence](accounting-ledger-setup/accounting-ledger-setup-evidence.md) · packets: [00](accounting-ledger-setup/generated/PHASE-00-implementation-preflight.md) [01](accounting-ledger-setup/generated/PHASE-01-domain-api.md) [02](accounting-ledger-setup/generated/PHASE-02-web-client.md) [03](accounting-ledger-setup/generated/PHASE-03-mobile-client.md) [04](accounting-ledger-setup/generated/PHASE-04-domain-actions.md) [05](accounting-ledger-setup/generated/PHASE-05-integration-runtime.md) [06](accounting-ledger-setup/generated/PHASE-06-verification-acceptance.md) [07](accounting-ledger-setup/generated/PHASE-07-customer-education-closure.md) |
| `fiscal-years` | [Review](fiscal-years/fiscal-years-review.md) · [API](fiscal-years/fiscal-years-api.md) · [Web](fiscal-years/fiscal-years-web.md) · [Mobile](fiscal-years/fiscal-years-mobile.md) · [Request](fiscal-years/fiscal-years-request.md) · [Evidence](fiscal-years/fiscal-years-evidence.md) · packets: [00](fiscal-years/generated/PHASE-00-discovery-evidence.md) [01](fiscal-years/generated/PHASE-01-domain-api.md) [02](fiscal-years/generated/PHASE-02-web-client.md) [03](fiscal-years/generated/PHASE-03-mobile-client.md) [04](fiscal-years/generated/PHASE-04-domain-actions.md) [05](fiscal-years/generated/PHASE-05-integration-runtime.md) [06](fiscal-years/generated/PHASE-06-final-reconciliation.md) |
| `ledger-setup-coa-hierarchy` | [Review](ledger-setup-coa-hierarchy/ledger-setup-coa-hierarchy-review.md) · [API](ledger-setup-coa-hierarchy/ledger-setup-coa-hierarchy-api.md) · [Web](ledger-setup-coa-hierarchy/ledger-setup-coa-hierarchy-web.md) · [Mobile](ledger-setup-coa-hierarchy/ledger-setup-coa-hierarchy-mobile.md) · [Request](ledger-setup-coa-hierarchy/ledger-setup-coa-hierarchy-request.md) · [Evidence](ledger-setup-coa-hierarchy/ledger-setup-coa-hierarchy-evidence.md) · packets: [00](ledger-setup-coa-hierarchy/generated/PHASE-00-implementation-preflight.md) [01](ledger-setup-coa-hierarchy/generated/PHASE-01-domain-api.md) [02](ledger-setup-coa-hierarchy/generated/PHASE-02-web-client.md) [03](ledger-setup-coa-hierarchy/generated/PHASE-03-mobile-client.md) [04](ledger-setup-coa-hierarchy/generated/PHASE-04-domain-actions.md) [05](ledger-setup-coa-hierarchy/generated/PHASE-05-integration-runtime.md) [06](ledger-setup-coa-hierarchy/generated/PHASE-06-verification-acceptance.md) [07](ledger-setup-coa-hierarchy/generated/PHASE-07-customer-education-closure.md) |
| `ledger-setup-currency` | [Review](ledger-setup-currency/ledger-setup-currency-review.md) · [API](ledger-setup-currency/ledger-setup-currency-api.md) · [Web](ledger-setup-currency/ledger-setup-currency-web.md) · [Mobile](ledger-setup-currency/ledger-setup-currency-mobile.md) · [Request](ledger-setup-currency/ledger-setup-currency-request.md) · [Evidence](ledger-setup-currency/ledger-setup-currency-evidence.md) · packets: [00](ledger-setup-currency/generated/PHASE-00-implementation-preflight.md) [01](ledger-setup-currency/generated/PHASE-01-domain-api.md) [02](ledger-setup-currency/generated/PHASE-02-web-client.md) [03](ledger-setup-currency/generated/PHASE-03-mobile-client.md) [04](ledger-setup-currency/generated/PHASE-04-domain-actions.md) [05](ledger-setup-currency/generated/PHASE-05-integration-runtime.md) [06](ledger-setup-currency/generated/PHASE-06-verification-acceptance.md) [07](ledger-setup-currency/generated/PHASE-07-customer-education-closure.md) |
