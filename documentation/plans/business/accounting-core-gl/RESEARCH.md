# Accounting Core GL — Research Notes

> **Current research cycle — 2026-11-04.** Compare the existing plan for business
> fit, simplicity and maintenance, assuming zero accepted delivery and targeting
> Angular. Repository findings below are historical source evidence, not current
> acceptance. See `DISCOVERY.md` section 15.

## Current fiscal-localization review

The requester selected Egypt for first launch, subsequently expanded the initial
design to **Egypt and Saudi Arabia**, and requires multiple activities, B2B/B2C
and Egyptian electronic invoice/receipt channels at first operation. D-030–D-033
record those decisions. This supersedes earlier unresolved-country and
manual-GL-only release assumptions; exact runtime decomposition remains open.

Read [`FISCAL_LOCALIZATION_REVIEW.md`](FISCAL_LOCALIZATION_REVIEW.md) for the
detailed Odoo/ETA/ZATCA comparison, official source register, verified repository
observations, design proposals, maintenance/versioning behavior and acceptance
scenarios. It also records source-age limitations, Egyptian 2026 amendments,
schema/precision/signing questions, the Saudi clearance/reporting distinction and
remaining DEC-007/032/033/034 items.

Online ERP invoicing is recommended as the first journey after the requester
asked which option is best. It is not approved yet. POS/offline scope, legal
issuance/posting policy and client capability boundaries require discussion.

## Repository research

| Topic | Finding | Planning use |
| --- | --- | --- |
| Accounting foundation | Existing module layers/bootstrap/tests/DbContext/schema/migrations | Reuse current module |
| Fiscal Years | Existing CQRS/API/Web/Mobile/lifecycle/permissions/tests | Verified dependency/reference |
| Messaging | Accounting-local Inbox/Outbox exist | Reuse integration reliability |
| Contacts | Accounting PartyReference projection exists | Preserve Party ownership |
| Web components | Shared forms/grid/header/dialogs/states/tree exist | Reuse mapping |
| Mobile components | AppForm/AppDataTable/AppListScreen/AppHierarchicalTree/dialogs/states exist | Reuse mapping |
| Planning system | Discovery → Evidence → Spec → Plan → G0–G4 | Canonical planning flow |

## Source material

- `documentation/modules/accounting/SOURCE-PLAN_AR.md` (v1.3; the v1.0 source was retired on 2026-10-12)
- `documentation/modules/accounting/ARCHITECTURE.md`
- `documentation/modules/accounting/DELIVERY-ROADMAP.md`

Historical plans are context, never proof of current implementation when runtime
source disagrees.

## External comparison material

The historical Accounting source includes Odoo, Dynamics 365 Finance and NetSuite
comparison links. They are capability-completeness references only; they do not
freeze ERPSYSTEM policy, country compliance, UI or ownership.

### Official Odoo reference set — reviewed 2026-11-04

Comparison baseline: **Odoo 19.0 documentation**, explicitly versioned for this
review; no claim that it is the newest release. Where the rendered site could
not be retrieved, the corresponding English source was read in Odoo's official
`odoo/documentation` repository on branch `19.0`. The links below point to both.
These are annotated references, not a vendored copy of Odoo documentation.

| Ref | Topic and official documentation | Official source read | Use in this review |
| --- | --- | --- | --- |
| OD-01 | [Accounting setup and onboarding](https://www.odoo.com/documentation/19.0/applications/finance/accounting/get_started.html) | [get_started.rst](https://github.com/odoo/documentation/blob/19.0/content/applications/finance/accounting/get_started.rst) | Dependency order, master data, defaults and opening-data boundaries; country-specific requirements remain DEC-007 |
| OD-02 | [Chart of Accounts](https://www.odoo.com/documentation/19.0/applications/finance/accounting/get_started/chart_of_accounts.html) | [chart_of_accounts.rst](https://github.com/odoo/documentation/blob/19.0/content/applications/finance/accounting/get_started/chart_of_accounts.rst) | Account types, grouping, code/name, currency, reconciliation and deprecation; compare against D-010–D-014 and D-024 |
| OD-03 | [Journals](https://www.odoo.com/documentation/19.0/applications/finance/accounting/get_started/journals.html) | [journals.rst](https://github.com/odoo/documentation/blob/19.0/content/applications/finance/accounting/get_started/journals.rst) | Journal definitions, sequences, allowed accounts and defaults; distinguish configuration from transaction lifecycle |
| OD-04 | [Multi-currency](https://www.odoo.com/documentation/19.0/applications/finance/accounting/get_started/multi_currency.html) | [multi_currency.rst](https://github.com/odoo/documentation/blob/19.0/content/applications/finance/accounting/get_started/multi_currency.rst) | Company currency, dated rates, account/journal currency constraints and FX purposes; no automatic approval of a rate provider |
| OD-05 | [Analytic accounting](https://www.odoo.com/documentation/19.0/applications/finance/accounting/reporting/analytic_accounting.html) | [analytic_accounting.rst](https://github.com/odoo/documentation/blob/19.0/content/applications/finance/accounting/reporting/analytic_accounting.rst) | Compare dimensions/applicability and percentage allocations as separate capabilities; do not silently add allocations to Core GL |
| OD-06 | [Fiscal localizations](https://www.odoo.com/documentation/19.0/applications/finance/fiscal_localizations.html) | [fiscal_localizations.rst](https://github.com/odoo/documentation/blob/19.0/content/applications/finance/fiscal_localizations.rst) | First review dependency: target jurisdictions and country-dependent chart/setup/reporting requirements; resolves the design impact of DEC-007 before dependent choices |
| OD-07 | [Egypt localization](https://www.odoo.com/documentation/19.0/applications/finance/fiscal_localizations/egypt.html) | [egypt.rst](https://github.com/odoo/documentation/blob/19.0/content/applications/finance/fiscal_localizations/egypt.rst) | Egypt selected for the first release; compare base localization and the separately documented ETA e-invoicing integration without adopting Odoo's implementation or asserting statutory completeness |
| OD-13 | [Saudi localization](https://www.odoo.com/documentation/19.0/applications/finance/fiscal_localizations/saudi_arabia.html) | [saudi_arabia.rst](https://github.com/odoo/documentation/blob/19.0/content/applications/finance/fiscal_localizations/saudi_arabia.rst) | Subsequent requester direction adds Saudi Arabia to initial design; compare base, reports, Phase 2 and POS boundaries. Runtime rollout remains a separate decision |
| OD-14 | [Companies](https://www.odoo.com/documentation/19.0/applications/general/companies.html) | [companies.rst](https://github.com/odoo/documentation/blob/19.0/content/applications/general/companies.rst) | Company/legal-entity versus branch distinction for the requester's initial setup choice |
| OD-15 | [Multi-company](https://www.odoo.com/documentation/19.0/applications/general/companies/multi_company.html) | [multi_company.rst](https://github.com/odoo/documentation/blob/19.0/content/applications/general/companies/multi_company.rst) | Several companies in one environment, scoped settings/access and explicitly shared data |
| OD-16 | [Accounting and branches](https://www.odoo.com/documentation/19.0/applications/finance/accounting.html) | [accounting.rst](https://github.com/odoo/documentation/blob/19.0/content/applications/finance/accounting.rst) | Per-company chart with optional sharing; branches inherit parent chart/currency/tax settings |

Odoo documentation describes its product. It does not prove ERPSYSTEM behavior,
settle local statutory obligations, or establish edition/hosting availability for
our product. Any adopted rule still needs an explicit local decision and evidence.

### First review dependency — fiscal localization

The requester corrected the review order on 2026-11-04: fiscal localization
precedes detailed Chart of Accounts choices. OD-01 verifies localization at
database/company creation, before master-data setup. OD-06 describes country
packages affecting accounts, taxes, statements and certifications, and documents
Odoo's restriction on switching a package after an entry is posted.

For ERPSYSTEM, first identify the initial jurisdictions, the requirements that
affect core/setup design, and each country's Required/Deferred/Excluded delivery
scope. This is a design dependency, not approval to copy Odoo's package-switch
rule or a requirement to implement every tax/invoicing integration before any
ledger work. Country-specific obligations require authoritative local research
after the jurisdictions are known.

DEC-007 therefore blocks country-dependent COA/setup decisions as well as release.
Generic accounting invariants can still be discussed. The previous proposal to
start with account structure is corrected; DEC-029/030/031 remain open and queued
behind this localization review.

#### Egypt selection and live-screen access — 2026-11-04

The requester selected Egypt for the first Accounting release. OD-07 lists the
base Egyptian localization and ETA invoice integration separately, and describes
company/branch/activity, customer/product/tax-code and signing setup. These are
comparison prompts; product scope and current Egyptian obligations still need
decisions and authoritative Egyptian evidence under DEC-007.

The official public demo was opened through `https://demo.odoo.com`, redirecting
to `https://demo3.odoo.com/odoo`. Read-only navigation reached Accounting Dashboard
and Configuration → Settings (`https://demo3.odoo.com/odoo/action-346`). Initial
Setup/Fiscal Localization, tax defaults, currencies, default accounts and fiscal
period settings were visible. No settings were changed or saved.

This demo's visible fiscal country was United States, currency USD, and package
label was `Ogólny (minimalny) plan kont`; it is **not Egyptian localization UI
evidence**. Its documentation links point to `20.0`; actual server build/edition
was not verified. Keep this screen observation separate from the pinned 19.0
documentation baseline. The screenshot is a visual discussion aid, not ERP runtime
acceptance. User-specific/Egypt-specific UI remains unverified.

### Subsequent comparison batch — company setup and account structure

Company-boundary answer on 2026-11-04: the requester selected the first option,
one primary fiscal country per legal company, recorded as D-034. OD-06 explicitly
allows different localizations for different companies and keeps branches on the
parent localization. OD-14/15 support the independent-entity/multi-company model;
OD-16 also documents optional account sharing. This supports our starting boundary
without implying that all Odoo data or accounts are strictly unshareable.
Cross-country registrations for one legal entity are Deferred under DEC-034,
reopened only for a concrete target-company requirement before its rollout.

| Topic | Existing plan | Odoo reference observation | Local review proposal / maintenance impact | Decision |
| --- | --- | --- | --- | --- |
| Company chart ownership | D-010: independent chart per company | OD-02 also documents optional cross-company shared accounts | Retain independent charts as the starting proposal; shared identity would need a demonstrated use case | Prior rule under review; no change approved |
| Hierarchy | D-011: configured levels and posting eligibility | OD-02: groups use code prefixes by default | Compare explicit parent/child depth with separately managed levels; fewer independent policies can reduce configuration and validation work | DEC-029 Open |
| Account codes | D-024: editable `ACC-####` proposal, independent hierarchy | OD-02: account code and grouping interact | Review readable accounting codes and editability; choose hierarchy coupling deliberately | DEC-030 Open |
| New-company setup | Templates may initialize independent charts; onboarding is not specified | OD-01: localization provides initial masters | Consider an optional editable starter, with jurisdiction-neutral labeling until DEC-007 | DEC-031 Open |
| Currency | DEC-008/D-021: explicit functional currency and primary book | OD-04: company currency plus foreign currencies/rates | Discuss currency policy in its own batch; a simpler setup screen does not by itself remove the need for rate history | Later comparison batch |

All local proposals above are analysis, not decisions attributed to the requester.

### Superpowers workflow reference

The requester explicitly requested Superpowers for this discussion. No installed
Superpowers skill was found in the repository/user skill locations. The official
[using-superpowers](https://github.com/obra/superpowers/blob/main/skills/using-superpowers/SKILL.md)
and [brainstorming](https://github.com/obra/superpowers/blob/main/skills/brainstorming/SKILL.md)
instructions were read from upstream for this session; no plugin was installed.
Use comparison, focused questions and explicit trade-offs during discovery.
The repository's central documentation paths and discovery protocol govern where
answers/decisions are recorded. No implementation plan or runtime work is
authorized by reading these skills.

## Research still required

1. Complete applicable Egypt/Saudi statutory/accounting/retention matrices and
   verify deployed technical contracts under DEC-007. Initial design countries
   and Egyptian electronic-channel inclusion are resolved; detailed coverage and
   Saudi rollout remain DEC-032. Current findings are in the linked fiscal review.
2. Exact multi-book/reporting-currency requirements if DEC-008 enables them.
3. Representative journal/ledger/query scale before production approval.
4. Legacy-source schema/quality when a real cutover source is selected.
5. Resolve DEC-033 issuance/posting/failure semantics and DEC-034
   master/site/device/signing ownership before transaction/setup contracts.
