# Accounting Core GL — Evidence Ledger

## Scope of investigation

Inspected the Accounting module bootstrap, DbContext and DI, current Fiscal Years
API/tests/Web/Mobile surfaces, Accounting architecture/roadmap, the detailed Arabic
Accounting source plan, shared client UI libraries, and the canonical planning system.

## Evidence ledger

| Evidence ID | Classification | Finding | Source | Planning consequence |
| --- | --- | --- | --- | --- |
| E-001 | VERIFIED CURRENT | Accounting already has Contracts, Domain, Application, Infrastructure, Presentation, bootstrap and module tests. | `api/Modules/Accounting/*`; `AccountingModule.cs:12-33` | Extend current module; no parallel stack. |
| E-002 | VERIFIED CURRENT | `AccountingDbContext` owns `acc`, migrations, RowVersion and tenant isolation. | `AccountingDbContext.cs:14-88`; `DependencyInjection.cs:26-45` | New Core GL entities use existing context/schema/history. |
| E-003 | VERIFIED CURRENT | Accounting owns Inbox/Outbox and `PartyReference`. | `AccountingDbContext.cs:44-50`; `DependencyInjection.cs:38-45` | Reuse messaging/projection boundaries. |
| E-004 | VERIFIED CURRENT | Module catalog already exposes Fiscal Years and Invoicing; Contacts is an optional dependency. | `AccountingModule.cs:15-26` | Extend existing module definition. |
| E-005 | VERIFIED CURRENT | Fiscal Years have API/CQRS, permissions, concurrency and lifecycle operations. | `FiscalYearsController.cs:10-110`; `FiscalYearsControllerContractTests.cs` | Fiscal Years are dependency/reference, not greenfield work. |
| E-006 | VERIFIED CURRENT | Web has a routed Accounting Fiscal Years feature using shared list/form/permission patterns. | `web-next/src/modules/accounting/fiscal-years/` | Use as Web implementation reference. |
| E-007 | VERIFIED CURRENT | Mobile has Fiscal Years using `AppListScreen`, `AppDataTable`, shared permissions/forms/dialogs. | `mobile-react/src/modules/accounting/fiscal-years/` | Use as Mobile implementation reference. |
| E-008 | VERIFIED CURRENT | Web shared UI includes grid, page header, form system, feedback/dialogs and hierarchy components. | `web-next/src/shared/components/` | Reuse-first COA/list/form mapping. |
| E-009 | VERIFIED CURRENT | Mobile shared UI includes `AppForm`, `AppDataTable`, `AppListScreen`, `AppStateView`, `AppHierarchicalTree`. | `mobile-react/src/shared/components/` | Reuse-first Mobile mapping. |
| E-010 | VERIFIED CURRENT | Platform owns identity/tenancy/company/branch; Accounting owns financial truth. | `documentation/modules/accounting/ARCHITECTURE.md:8-30` | No duplicate master data. |
| E-011 | VERIFIED CURRENT | Roadmap records Fiscal Years implemented and orders configuration → COA → GL → subledgers → integrations → close/reporting. | `documentation/modules/accounting/DELIVERY-ROADMAP.md:7-44` | Align the first new plan to current state. |
| E-012 | REQUESTED TARGET | Core GL is the first major business milestone proving setup → journal → posting → GL/TB → reverse/correct → period control. | `ACCOUNTING_MODULE_PHASES_AR.md:123-144`; requester approval | Scope this plan to the backbone. |
| E-013 | REQUESTED TARGET | Posting is centralized, balanced, immutable, idempotent, concurrency-safe and server-authoritative. | `ACCOUNTING_MODULE_PHASES_AR.md:51-71` | Plan invariants and acceptance rules. |
| E-014 | REQUESTED TARGET | Posting Profiles are effective-dated/versioned; missing/ambiguous match blocks posting. | `ACCOUNTING_MODULE_PHASES_AR.md:68,86` | No hard-coded source accounts. |
| E-015 | REQUESTED TARGET | Web and Mobile are required; offline financial posting excluded. | `ACCOUNTING_MODULE_PHASES_AR.md:18,62,71` | Plan client parity and online mutation authority. |
| E-016 | REQUESTED TARGET | External UI is design input; project shared components remain canonical. | `PLAN_CREATION_PROTOCOL.md:93-125`; `AGENTS.md:79-121` | UI reuse mapping required. |
| E-017 | ASSUMPTION | Manual journal + GL/TB is enough to prove the posting backbone before AP/AR. | Dependency analysis | Validate at Core GL acceptance. |
| E-018 | VERIFIED CURRENT | Current Fiscal Years lifecycle drives/generated period states as part of the year lifecycle, but current evidence does not expose an independent per-period close/lock API. | `FiscalYearsController.cs`; `FiscalYear.cs`; `FiscalPeriod.cs` | Slice 1 reuses current authority only; Month Closing/per-period control is explicit additive target scope later. |
| E-019 | UNKNOWN | Launch jurisdiction/statutory/retention baseline not fixed. | No approved policy | DEC-007. |
| E-020 | REQUESTED TARGET | Core GL V1 uses one functional currency and one primary book per company; multi-currency postings keep historical/applied-rate evidence; reporting currency is optional report-time translation; additional adjustment books are deferred. | Requester-approved discovery, DEC-008 | Freeze Slice 1 book/currency schema without a parallel reporting ledger. |
| E-021 | REQUESTED TARGET | Branch is analysis/authorization context only in Core GL V1; branch balancing/intercompany are deferred. | Requester-approved discovery, DEC-009 | Do not build interbranch/intercompany balancing into Slice 1. |
| E-022 | REQUESTED TARGET | Approval and SoD are policy-driven: None/Single/MultiLevel, default blocked self-approval, separate Approve/Post permissions, audited override/reopen. | Requester-approved discovery, DEC-010 | Workflow can implement configurable policies without hard-coded thresholds. |
| E-025 | REQUESTED TARGET | Company COA ownership, configurable hierarchy/posting levels, control-account manual-posting policy and configurable dimensions are approved. | Requester-approved discovery | Slice 1 setup contracts can be frozen. |
| E-026 | REQUESTED TARGET | Link Accounts is direct typed purpose mapping; banks map by BankAccount, contacts by ContactGroup + PartyRole + Purpose, with specific overrides; complex conditions use Posting Profiles. | Requester-approved discovery | One underlying account-determination model, two UX levels. |
| E-027 | REQUESTED TARGET | Source modules send typed purpose/components and accounting context without GL AccountIds; Accounting resolves accounts and owns journals/GL. | Requester-approved discovery | Freeze future posting boundary and prevent module coupling. |
| E-028 | REQUESTED TARGET | `JournalEntry` + `JournalLine` is the only financial truth; posting makes the same lines immutable; report acceleration uses rebuildable projections only. | Requester-approved discovery | Remove duplicated PostedLedgerEntry persistence target. |
| E-023 | NOT APPLICABLE | Consumer pricing/refunds/subscriptions/AI/UGC licensing are not Core GL scope. | Core GL scope | Commercial terms N/A for this slice. |
| E-024 | NOT APPLICABLE | Payment-provider link/webhook lifecycle is not Accounting Core GL ownership. | `ARCHITECTURE.md:78-93` | Future Payments owner handles provider state. |

## Conflicts / drift found

| ID | Sources in conflict | Authoritative now | Required correction |
| --- | --- | --- | --- |
| DRIFT-001 | Root plan treats business/Fiscal Years as not started vs current runtime/roadmap | Runtime + current roadmap | Treat Fiscal Years as VERIFIED CURRENT. |
| DRIFT-002 | Root plan calls itself execution plan vs central planning system/module roadmap | `documentation/plans/` + current roadmap | Root becomes source/roadmap material; feature plan is execution authority. |
| DRIFT-003 | Old phases package says all phases unstarted/canonical | Runtime + central planning protocol | Reclassify package as historical/source reference. |
| DRIFT-004 | Root plan includes payment-provider concerns in Accounting | Current Accounting architecture | Keep provider lifecycle out of Core GL. |

## Gaps that code/evidence cannot answer

| Gap | Why it matters | Owner | Decision / assumption / note ID |
| --- | --- | --- | --- |
| Initial jurisdiction/retention | Changes statutory fields/evidence/retention | Product + Accounting + Compliance | DEC-007 |
| Book/reporting-currency model | Resolved for V1; reopen only for parallel-ledger/stored-reporting requirements | Product + Architecture | DEC-008 |
| Branch/intercompany behavior | Deferred outside V1 | Product + Architecture | DEC-009 |
| SoD/override matrix | Baseline resolved; stricter company/jurisdiction policy may reopen | Product + Security + Finance | DEC-010 |
| Representative scale | Needed for production acceptance | Accounting + Performance | RISK-007 |

## External/version-sensitive evidence

No external product documentation proves current runtime behavior. Historical
Odoo/Dynamics/NetSuite links remain capability-comparison material only.
Jurisdiction-specific requirements must be researched after DEC-007.

## Audit conclusion

Current foundations and Fiscal Years are proven. Core GL is target-only. The plan
must extend current ownership and UI foundations rather than reproduce the historical
phase plan. DEC-008/009/010 are now requester-resolved; DEC-007 remains a
jurisdiction-dependent production-launch decision rather than a Slice 1 blocker.
