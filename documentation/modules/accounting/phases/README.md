# Accounting historical delivery phases

Version 1.1 · 2026-09-19 · **Source/reference package — not current execution status**

This package preserves the lossless historical 00–21 Accounting decomposition.
It is no longer the canonical implementation authority after adoption of the
central planning system under `documentation/plans/`.

Current runtime evidence is owned by the Accounting module books and source. Fiscal
Years is already implemented end to end and must not be treated as greenfield work.
The canonical module ordering lives in
[`../DELIVERY-ROADMAP.md`](../DELIVERY-ROADMAP.md), and individual execution
capabilities use gated plans such as
[`accounting-core-gl`](../../../plans/business/accounting-core-gl/PLAN.md).

## Scope and boundaries

The target covers company/branch accounting, chart of accounts, partners,
dimensions, currencies, journals, subledgers, cash/banks, financial invoices
and taxes, checks, expenses/advances, assets/depreciation, deferrals, financing
when applicable, reports, budgets, forecasting, and close. Web and mobile are
required for functional capabilities, including a suitable report-designer
experience on both platforms. Offline financial posting is out of scope.

Business modules and operational workflows outside this Accounting package are
not selected by this technical plan. Any future external operational facts must
come from an explicitly approved trusted source and pass reconciliation before
financial statement approval. Complex consolidation, specialized leasing, and
derivatives likewise require a separately approved scope.

## Historical rules captured from the source phases

The source plan's common rules are recorded once here for traceability. They describe
the intent that the historical phases were expected to follow; they do **not**
authorize or govern current implementation. Current capability plans decide which
rules are applicable. Historically, the source required teams to inspect the environment
first; use one central posting engine; keep posted entries balanced, immutable,
auditable, idempotent, and corrected by new linked entries; use decimal amounts
with declared precision/rounding; distinguish document/accounting/due dates;
snapshot account/rule/price/dimension versions; protect transactions with
concurrency controls and duplicate keys; isolate tenant/company/branch in API,
reports, files, and jobs; separate create/approve/post; use subledger details
without one GL account per person/asset; publish external events only after a
successful transaction with reliable deduplication; enforce rules server-side
with a shared API and Arabic/English RTL UI; never assume country tax,
depreciation, or check policy; and start reconciliation with the posting engine.

### Historical reuse-inventory expectation

The historical source expected each phase to search shared BuildingBlocks, shared UI/services,
Contracts, and reusable Accounting-local pieces. Record what is reused,
extended, rejected, and why. New pieces start module-local. Promote only a
genuinely domain-neutral abstraction that is used by multiple modules. Never
place Accounting domain logic in shared code or copy/paste an existing shared
capability.

## Historical dependency matrix

The table below preserves the source-plan dependency model for traceability. Its
status column is historical and must not be used as current runtime evidence.

| Phase | Name | Dependencies | Status |
| --- | --- | --- | --- |
| 00 | Analysis and scope freeze | — | Superseded by central Discovery/Evidence/Spec planning flow |
| 01 | Technical and security foundation | 00 | Foundation verified; future gaps are feature-scoped |
| 02 | Configuration and chart of accounts | 01 | Partial: Fiscal Years current; remaining setup/COA planned through gated plans |
| 03 | Partners and groups | 02 | Planned / Not started |
| 04 | Dimensions and allocations | 02, 03 | Planned / Not started |
| 05 | Ledgers, currencies, numbering | 02 | Planned / Not started |
| 06 | Journal and approval engine | 03, 04, 05 | Planned / Not started |
| 07 | Subledger and opening balances | 06 | Planned / Not started |
| 08 | Core reports | 07 | Planned / Not started |
| 09 | Tax engine and country contract | 03, 05, 06 | Planned / Not started |
| 10 | Treasury and banks | 07 | Planned / Not started |
| 11 | Financial invoices | 09, 10 | Planned / Not started |
| 12 | Expenses and advances | 09, 10 | Planned / Not started |
| 13 | Checks | 10 | Planned / Not started |
| 14 | Returns and electronic integration | 09, 11, 12 | Planned / Not started |
| 15 | Assets and depreciation | 11, 14 | Planned / Not started |
| 16 | Accruals and deferrals | 11, 14 | Planned / Not started |
| 17 | Loans and facilities | 10 | Planned / Not started; applicability undecided |
| 18 | Report designer and reporting pack | 08, 13, 14, 15, 16, 17 when applicable | Planned / Not started |
| 19 | Budgets and liquidity forecast | 08, 11, 12, 13, 16, 17 when applicable | Planned / Not started |
| 20 | Review and close | Applicable phases 08–18 | Planned / Not started |
| 21 | Migration and go-live approval | 19, 20 | Planned / Not started |

The dependency table records the historical intended order only. Tax was split between 09 and 14 so country
requirements are frozen before invoice release. Phase 17 requires an explicit
N/A decision before it can be skipped. No taxable document goes live before the
mandatory country gates in 14.

The historical Phase 00 also required confirmation of the platform ownership boundary:
Accounting consumes Platform identity, tenancy, company, and branch
capabilities through Contracts or stable abstractions. It does not recreate
their tables, services, or UI; only Accounting-specific financial authorization
belongs inside the module.

## Historical tracking and final acceptance artifacts

The historical package used [PHASE-TRACKING-TEMPLATE.md](PHASE-TRACKING-TEMPLATE.md)
for phase tracking and [FINAL-ACCEPTANCE.md](FINAL-ACCEPTANCE.md) for its integrated
acceptance scenario, including retries, failed batches, concurrent requests,
unauthorized access, reconciliation, restore, audit evidence, and both client
platforms. These files remain traceability/source material only; current execution
evidence is defined by the registered capability plan and repository planning system.

The lossless Arabic source is retained as
[SOURCE-PLAN_AR.md](SOURCE-PLAN_AR.md). Numbered phase files remain historical
source/traceability material; they are **not** canonical execution units. Runtime
implementation requires the corresponding registered plan under
`documentation/plans/business/`.
