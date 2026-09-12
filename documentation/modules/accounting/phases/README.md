# Accounting delivery phases

Version 1.0 · 2026-09-08 · **All phases are Planned / Not started**

This package is the canonical Accounting implementation plan. It is derived
from the Arabic source plan formerly kept at repository root and is intentionally
separate from runtime evidence: the Accounting module currently contains only
the six-project foundation, `AccountingDbContext`, `acc` schema, bootstrap, and
empty initial migration.

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

## Rules shared by every phase

The source plan's common rules are recorded once here. Every phase must apply
them and link back instead of copying them. In summary: inspect the environment
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

### Mandatory reuse inventory gate

At the start of **every phase**, search shared BuildingBlocks, shared UI/services,
Contracts, and reusable Accounting-local pieces. Record what is reused,
extended, rejected, and why. New pieces start module-local. Promote only a
genuinely domain-neutral abstraction that is used by multiple modules. Never
place Accounting domain logic in shared code or copy/paste an existing shared
capability.

## Dependency matrix and status

| Phase | Name | Dependencies | Status |
| --- | --- | --- | --- |
| 00 | Analysis and scope freeze | — | Planned / Not started |
| 01 | Technical and security foundation | 00 | Planned / Not started |
| 02 | Configuration and chart of accounts | 01 | Planned / Not started |
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

The dependency table controls order. Tax is split between 09 and 14 so country
requirements are frozen before invoice release. Phase 17 requires an explicit
N/A decision before it can be skipped. No taxable document goes live before the
mandatory country gates in 14.

For this repository, Phase 00 must also confirm the platform ownership boundary:
Accounting consumes HR/platform identity, tenancy, company, and branch
capabilities through Contracts or stable abstractions. It does not recreate
their tables, services, or UI; only Accounting-specific financial authorization
belongs inside the module.

## Tracking and final acceptance

Use [PHASE-TRACKING-TEMPLATE.md](PHASE-TRACKING-TEMPLATE.md) for each phase.
Use [FINAL-ACCEPTANCE.md](FINAL-ACCEPTANCE.md) for the integrated scenario,
including retries, failed batches, concurrent requests, unauthorized access,
reconciliation, restore, audit evidence, and both client platforms.

The lossless Arabic source is retained as
[SOURCE-PLAN_AR.md](SOURCE-PLAN_AR.md); the numbered phase files are the
canonical execution units.
