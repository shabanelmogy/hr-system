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
| E-010 | VERIFIED CURRENT | Platform owns identity/tenancy/company; HR owns Branch/CostCenter; Accounting owns financial truth. | `documentation/modules/accounting/ARCHITECTURE.md:8-30` | No duplicate master data. |
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
| E-029 | HISTORICAL PHASE-00 DISCOVERY | Phase 00 inspection found a company-scoped `Currency` master inside HR Organizational Structure with `CurrencyCode`, symbol, `ExchangeRateToDefault` and `IsDefault`; HR financial workflows persisted currency **codes**, not `CurrencyId` foreign keys. Earlier Geography/Countries guidance already reserved financial Currency ownership for Finance/Payroll once that bounded context existed. | Phase 00 repository evidence; `ORGANIZATIONAL_STRUCTURE_FEATURE_FULL_REVIEW.md:9-41`; `GEOGRAPHICAL_INFORMATION_DOMAIN_GUIDE.md:152-156`; `COUNTRIES_FEATURE_FULL_REVIEW.md:151-154`; HR currency-code scan | Repository is development-only, so do not preserve the transitional owner. Rebaseline to one Accounting Currency master from `InitialAccounting`; `InitialHr` never creates Currency. HR consumes `IAccountingCurrencyCatalog` for snapshot validation. |
| E-030 | VERIFIED CURRENT | Current runtime has no BankAccount, PaymentMethod or Cashbox/Safe master, and Contacts currently exposes Party identity/events but no ContactGroup/PartyRole model. | Repository scan of `api/Modules`; `Contacts.Domain/Party.cs`; `Contacts.Contracts/PartyIntegrationEvents.cs` | Link Accounts keeps the approved typed/effective-dated model, but a source-specific mapping type is selectable only when its owning master/Contract exists. Slice 1 must not create fake source masters or placeholder FKs. Company-purpose defaults remain usable for the first posting context. |
| E-031 | VERIFIED CURRENT | Branch and CostCenter remain HR Organizational Structure capabilities, while Platform owns tenant/company/auth/membership. Currency is not an HR persistence responsibility in the clean baseline. | `HR.Domain/OrganizationalStructure`; `documentation/modules/hr/ARCHITECTURE.md`; D-020 | Correct stale Accounting documentation that attributed Branch to Platform. External dimension sources use owner Contracts/projections; HR CurrencyCode validation uses the Accounting Contract rather than a cross-module EF relationship. |
| E-032 | VERIFIED CURRENT | Currency client ownership is cut over end-to-end: Web and Mobile route management through `/finance/ledger-setup/currencies`, the former HR Organizational Structure Currency route/screen is removed, and HR user-selected CurrencyCode controls consume the Accounting active lookup. Read/page/lookup access uses `Currencies:View`; mutations use the exact `Currencies:Create/Edit/Archive/Restore` claim. | `web-next/src/modules/accounting/currencies/`; `web-next/src/lib/auth/route-access.ts`; `mobile-react/src/modules/accounting/currencies/`; `mobile-react/src/platform/auth/presentation/rbac/route-manifest.ts`; `documentation/mobile-react/MOBILE_API_COMPATIBILITY_MATRIX.json` | Keep one client ownership path and do not require a Currency mutation permission merely to populate HR Currency selectors. |
| E-033 | VERIFIED CURRENT | Phase 01 Ledger Setup Domain/API implements configurable hierarchy/accounts/dimensions, one primary Book, Journal definitions, FX, mappings/profiles and deterministic resolve preview through CQRS ports and thin controllers. | `api/Modules/Accounting/**/Finance/LedgerSetup`; `LedgerSetupDomainTests.cs` | Client slices may consume one canonical server contract; JournalEntry/posting remains absent. |
| E-034 | VERIFIED CURRENT | Mutable setup masters have explicit archive/restore, archived discovery, dependency guards, shared atomic resources and localized stable errors; effective/versioned records have an explicit non-destructive alternative. Global localization composition moved from HR to the host, and future module scaffolds receive an executable review gate. | `LedgerSetupLifecycleCommands.cs`; `LedgerSetupLifecycleTests.cs`; `HostJsonStringLocalizer.cs`; `LocalizationOwnershipArchitectureTests.cs`; `New-ErpModule.ps1` | A green build alone cannot close a feature; entity completion and localization ownership are mandatory for future modules. |
| E-035 | VERIFIED CURRENT | Named Slice 1 domain masters use distinct Arabic/English values in the current domain or typed feature contracts: Fiscal Year, Currency, Account Hierarchy Level, Account, Dimension Definition/Value, Book, Journal Definition, Exchange Rate Type and Posting Profile expose `NameAr`/`NameEn`. | `api/Modules/Accounting/ErpSystem.Modules.Accounting.Domain/Finance/FiscalYears/Entities/FiscalYear.cs`; `api/Modules/Accounting/ErpSystem.Modules.Accounting.Domain/Finance/LedgerSetup/Entities/`; Fiscal Years/Currency/COA typed client sources | Preserve bilingual values through create/edit/view/list/search and both clients; translation catalogs alone are not acceptance evidence. |
| E-036 | VERIFIED CURRENT / TARGET SPLIT | Fiscal Years and Currency have typed Web/Mobile feature ownership; COA has typed Web/Mobile source through Phase 03 but pending live verification. Remaining Ledger Setup client routes are reachable through generic catch-all resource models and therefore are compatibility evidence, not accepted target child architecture. | `web-next/src/modules/accounting/fiscal-years/`; `web-next/src/modules/accounting/currencies/`; `web-next/src/modules/accounting/ledger-setup/coa-hierarchy/`; Mobile counterparts; generic Ledger Setup resource screens | Revalidate Fiscal Years/Currency in roadmap order; complete COA live evidence; refactor remaining children into typed owners before claiming client completion. |
| E-037 | REQUESTED ACCEPTANCE AUTHORITY | The user requires a complete manual scenario after every Accounting roadmap step and will explicitly authorize or reject the transition to the next step. | User instruction; `MANUAL_ACCEPTANCE_SCENARIO_TEMPLATE.md`; `manual-acceptance/FISCAL-YEARS-STEP-01.md` | Keep one step Active; send exact Web/actual-device, bilingual, permission, negative, UI-pattern, cleanup and evidence cases; never infer acceptance from automation or silence. |
| E-023 | NOT APPLICABLE | Consumer pricing/refunds/subscriptions/AI/UGC licensing are not Core GL scope. | Core GL scope | Commercial terms N/A for this slice. |
| E-024 | NOT APPLICABLE | Payment-provider link/webhook lifecycle is not Accounting Core GL ownership. | `ARCHITECTURE.md:78-93` | Future Payments owner handles provider state. |

## Conflicts / drift found

| ID | Sources in conflict | Authoritative now | Required correction |
| --- | --- | --- | --- |
| DRIFT-001 | Root plan treats business/Fiscal Years as not started vs current runtime/roadmap | Runtime + current roadmap | Treat Fiscal Years as VERIFIED CURRENT. |
| DRIFT-002 | Root plan calls itself execution plan vs central planning system/module roadmap | `documentation/plans/` + current roadmap | Root becomes source/roadmap material; feature plan is execution authority. |
| DRIFT-003 | Old phases package says all phases unstarted/canonical | Runtime + central planning protocol | Reclassify package as historical/source reference. |
| DRIFT-004 | Root plan includes payment-provider concerns in Accounting | Current Accounting architecture | Keep provider lifecycle out of Core GL. |
| DRIFT-005 | Accounting architecture text attributes Branch ownership to Platform, while runtime/module architecture place Branch and CostCenter in HR Organizational Structure | Runtime + HR architecture | Correct the ownership text before Slice 1 implementation; Accounting consumes stable owner Contracts only. |
| DRIFT-006 | Phase 00 found a transitional HR Currency master even though canonical Geography/Countries guidance reserved financial Currency ownership for Finance/Payroll | D-020 clean-development rebaseline + canonical Geography/Countries guidance | Rewrite the development baselines: Accounting owns `acc.Currencies` from `InitialAccounting`; `InitialHr` never creates `hr.Currencies`; remove cutover/data-preservation artifacts and any legacy default/rate authority. |

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

Current foundations, Fiscal Years, Currency ownership and the broad Slice 1
Domain/API are proven. Currency has historical typed client/closure evidence but is
queued for current v2 revalidation. COA has typed Web/Mobile implementation evidence
through Phase 03 and still needs live/database/closure evidence. The other Ledger
Setup client routes remain generic compatibility surfaces that must become typed
children; their reachability is not completion. Later posting/ledger slices remain
target work. Named domain entities already establish `NameAr`/`NameEn` as the data
shape, and the v2 child contracts now make end-to-end bilingual create/edit/view/list
verification an explicit closure gate. DEC-008/009/010 are requester-resolved;
DEC-007 remains a jurisdiction-dependent production-launch decision.
