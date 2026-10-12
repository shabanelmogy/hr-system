# Accounting Chart of Accounts and Hierarchy Review Artifacts

## Metadata

| Field | Value |
| --- | --- |
| Feature | `ledger-setup-coa-hierarchy` / Slice 1 child `1B` |
| Plan | `accounting-core-gl` / `Slice 1 — Ledger setup spine` |
| Screen contract | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-coa-hierarchy.md` |
| API route | `/api/v1/accounts` family |
| Web routes | `/finance/ledger-setup/accounts`, `/finance/ledger-setup/hierarchy-levels` |
| Mobile routes | `/finance/ledger-setup/accounts`, `/finance/ledger-setup/hierarchy-levels` |
| Review owner | Accounting Product + Architecture + implementation agent |
| Applied reference | `organizational-structure` interaction pattern only |
| Documentation state | Historical Phase 03 client implementation recorded; current v2 roadmap state is Queued behind Fiscal Years and Currency; Phase 06 live revalidation pending |
| Approved UI patterns | Accounts `P-002` + secondary `P-001`; Hierarchy Levels `P-001` |
| Import | Excluded on Web and Mobile |
| Reporting/export | Excluded in 1B |
| Customer Education | Required only after Phase 06 Verified |

## Requirement manifest

| ID | Requirement | Current evidence | API target | Web target | Mobile target | State |
| --- | --- | --- | --- | --- | --- | --- |
| R-01 | Accounting owns Account + hierarchy | Domain/DbContext/routes exist | Preserve | Consume | Consume | Verified current |
| R-02 | D-024 server proposed editable Account code | API `code-proposal` and typed form consumption | Implemented | Fetch/preserve on create | Fetch/preserve on create | API + Phase 02/03 static/focused verified; Phase 06 live pending |
| R-03 | Truthful Account page criteria/totals | API PageResponse + frozen allow-lists implemented | Implemented | Consume server total | Consume server total | API + typed clients implemented; Phase 06 live pending |
| R-04 | Account tree/detail/create/edit/archive/restore | API exists | Preserve/strengthen | Dedicated master/detail | Typed tree/detail | Phase 02/03 implemented; Phase 06 live pending |
| R-05 | Hierarchy-level lifecycle | API exists; update name validation parity closed | Implemented | Focused list/form | Focused list/form | Phase 02/03 implemented; Phase 06 live pending |
| R-06 | RowVersion before protected actions | Detail/lifecycle API exists | Preserve | detail fetch before write | detail fetch before write | Phase 02/03 implemented; Phase 06 live pending |
| R-07 | No generic COA client runtime | Generic runtime retained only for untouched siblings | N/A | Typed COA routes no longer use catch-all | Typed COA routes no longer use catch-all | Resolved in Phase 02/03; sibling migration remains separate |
| R-08 | EN/AR, RTL, responsive/accessibility | shared systems exist | localized stable errors | static/focused checks | static/focused checks | Phase 02/03 checks recorded; Phase 06 live pending |
| R-09 | Local mock-data draft action | D-025 shared form contract | local only | Account/Level/Currency/Fiscal Year + reachable sibling compatibility forms | Account/Level/Currency/Fiscal Year + reachable sibling compatibility forms | Focused utility/static checks; no persistence; compatibility coverage does not close 1C–1H |
| R-10 | Distinct required `NameAr` and `NameEn` across Account and Hierarchy Level API, forms, tree/list/detail/lookup/search and mock drafts | v2 child contract | Required | Required | Required | Contract frozen; live revalidation pending |

## Platform capability decisions

| Capability | API | Web | Mobile | Decision |
| --- | --- | --- | --- | --- |
| COA hierarchy | Required | Required SplitTreeView master/detail | Required AppHierarchicalTree | First-class workflow |
| Account list | Required typed page | Secondary/fallback only | Secondary when useful | server-owned criteria |
| Hierarchy Levels | Required | Required grid/form | Required list/form | focused child surface |
| Cards | N/A | Excluded | Excluded | no proven value |
| Chart/report/import/export | N/A | Excluded | Excluded | outside 1B |
| Drag/reparent | No route | Excluded | Excluded | reopen only with explicit contract |
| Realtime/notification | Deferred | Deferred | Deferred | no correctness dependency |

## Evidence register

| ID | Claim | Source | Verification |
| --- | --- | --- | --- |
| E-01 | Account/Level aggregates and invariants already exist | Accounting Domain `Finance/LedgerSetup/Entities/Account.cs`, `AccountHierarchyLevel.cs` | source inspection + module tests |
| E-02 | DB owns company code/level uniqueness and same-company FKs | `LedgerSetupConfigurations.cs` | EF model/migration inspection |
| E-03 | CQRS lifecycle exists | `SettingsAndAccountsCommands.cs`, `LedgerSetupLifecycleCommands.cs` | source + current 66/66 Accounting suite |
| E-04 | Account page is server-owned and truthful | `LedgerSetupQueries.cs`, `LedgerSetupStores.cs`, `AccountsController.cs` | PageResponse + focused runtime tests |
| E-05 | D-024 server proposal exists | `GetAccountCodeProposalQuery`, `AccountReadStore.GetCodeProposalAsync`, `AccountsController.CodeProposal` | source + focused runtime tests |
| E-06 | Web COA routes use the typed child while the umbrella generic renderer remains only for untouched siblings | typed COA pages/routes + `web-next/src/modules/accounting/ledger-setup/*` | source inspection + focused checks |
| E-07 | Cost Center proves SplitTreeView master/detail composition | `CostCenterTreeDiagram.tsx` + shared SplitTreeView | source + shared tests |
| E-08 | Currency proves typed Accounting Web/Mobile vertical patterns | `web-next/src/modules/accounting/currencies`, `mobile-react/src/modules/accounting/currencies` | source/tests |
| E-09 | Mobile Account/Level routes use typed COA screens; the generic Ledger Setup module remains only for untouched siblings | Expo route files + typed COA composition + generic sibling module | source inspection + focused checks |
| E-10 | Typed COA clients and local mock generators exist | Web/Mobile typed COA forms/pages + feature `utils/mockData` and tests | source inspection + focused client checks |
| E-11 | Reachable generic sibling forms obey D-025 until typed replacement | Web/Mobile generic form + `ledgerSetupMockData` utilities/tests | required lookup gating, real IDs, distinct FX currencies and boolean type checks |

## Detail/write field contract

| Field | Create | Edit | Tree | Detail | Lookup | Rule |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Code | Yes | Yes | Yes | Yes | Yes | server proposal on create, editable, company-unique |
| NameAr/NameEn | Yes | Yes | Yes | Yes | Yes | required localized names |
| AccountHierarchyLevelId | Yes | Yes | No | Yes | No | active same-company level |
| ParentAccountId | Optional | Optional | represented structurally | Yes | No | no cycle; parent cannot post |
| AllowPosting | Yes | Yes | Yes | Yes | Yes | level must CanPost; no children |
| ManualPostingPolicy | Yes | Yes | No | Yes | No | defined enum |
| CurrencyPolicy/SpecificCurrencyId | Yes | Yes | No | Yes | No | conditional Currency dependency |
| RowVersion | No | Required | No | Yes | No | protected writes/lifecycle |

## Lifecycle and permissions

| State | View | Create child | Edit | Archive | Restore |
| --- | --- | --- | --- | --- | --- |
| Active | Accounts:View | Accounts:Create when non-posting parent | Accounts:Edit | Accounts:Archive subject to dependencies | N/A |
| Archived | Accounts:View via status/detail | No | No | N/A | Accounts:Restore after revalidation |
| Global read-only | Allowed | Blocked client-side | Blocked | Blocked | Blocked |

API permissions remain authoritative in all cases.

## Import/reporting contracts

Import, report, chart and export are Excluded for this child. No transport, parser,
template, report dataset, viewer, upload control or placeholder route is part of 1B.

## Findings and handoffs

| ID | Severity | Finding | Evidence | Owner | Resolution |
| --- | --- | --- | --- | --- | --- |
| F-01 | High | Account code proposal was absent at runtime | D-024 + Phase 01 API implementation/tests | Accounting API | **Resolved Phase 01** |
| F-02 | High | Account page lacked a real total/criteria contract | Phase 01 PageResponse/read-store/query tests | Accounting API | **Resolved Phase 01** |
| F-03 | High | Web Accounts reuses SplitTreeView without the approved master/detail composition | LedgerSetupResourcePage vs CostCenterTreeDiagram | Web | **Resolved Phase 02; live Phase 06 evidence pending** |
| F-04 | High | Web/Mobile COA still use catch-all generic record/renderers | current Ledger Setup clients | Web/Mobile | **Resolved Phase 02/03 for COA routes; sibling generic runtime remains separate** |
| F-05 | Medium | Update hierarchy-level validator lacked name length parity with create | validator + focused test | Accounting API | **Resolved Phase 01** |
| F-06 | Medium | Tree nodes omit RowVersion by design, so protected actions require detail refresh | tree/detail contracts | Clients | Preserve explicit detail-fetch rule |
| F-07 | Medium | Mock action must not synthesize account identity or scope | D-025 + feature utility tests | Web/Mobile | **Resolved Phase 02/03; keep pure utility tests with future forms** |

## Verification baseline

| Layer | Check | Result | Date |
| --- | --- | --- | --- |
| Accounting module tests | `dotnet test Modules/Accounting/ErpSystem.Modules.Accounting.Tests/ErpSystem.Modules.Accounting.Tests.csproj -c Release --no-restore --nologo` | 66/66 PASS, including Phase 01 COA evidence | 2026-09-23 |
| Unique-conflict host mapping | `dotnet test Tests/ErpSystem.IntegrationTests/ErpSystem.IntegrationTests.csproj -c Release --no-restore --filter FullyQualifiedName~GlobalExceptionHandlerTests.UniqueConstraintException_ReturnsStableConflictProblemDetails` | 2/2 PASS for SQL unique codes 2601/2627 → stable 409 | 2026-09-22 |
| Persistence model drift | `dotnet test Tests/ErpSystem.IntegrationTests/ErpSystem.IntegrationTests.csproj -c Release --no-restore --no-build --filter FullyQualifiedName~ModulePersistenceFoundationTests.EveryModuleDbContext_HasBaselineMigrationAndNoPendingModelChanges` | 1/1 PASS; 1B introduces no pending model change | 2026-09-22 |
| Architecture tests | `dotnet test Tests/ErpSystem.ArchitectureTests/ErpSystem.ArchitectureTests.csproj -c Release --no-restore --nologo` | 58/58 PASS | 2026-09-23 |
| Web focused tests | COA service/error/tree/validation + typed and compatibility mock utility Vitest selection | 17/17 PASS | 2026-09-23 |
| Web static gates | type-check + lint + architecture + i18n | PASS | 2026-09-23 |
| Mobile focused tests | COA use-case/remote/repository/query-key/validation + typed and compatibility mock utility Jest selection | 20/20 PASS | 2026-09-23 |
| Mobile static gates | typecheck + lint + architecture + i18n | PASS | 2026-09-23 |
| Planning | `./documentation/plans/Check-Planning.ps1` | PASS — canonical planning checks clean | 2026-09-23 |
| Documentation — child/global recipes | `Generate-Documentation.ps1` then repository `-Check` | PASS — 101 registered recipes | 2026-09-23 |
| Diff | `git diff --check` + untracked utility whitespace scan | PASS | 2026-09-23 |
| Web/Mobile runtime | Typed/static implementation and focused client checks; live API-backed journey not run | Phase 06 responsibility | 2026-09-23 |

## Final reconciliation

Phase 00 decision: **READY FOR CODING — 2026-09-22** for
`ledger-setup-coa-hierarchy` only. API Phase 01 and typed Web/Mobile Phase 02/03
implementation are now recorded, including the D-025 local mock-draft contract and
safe compatibility coverage for still-reachable sibling forms. The final manifest,
four books, recipes and generated child packets are registered; this state does not
mark Phase 06 Verified or authorize customer education. For the current v2 roadmap,
the child remains Queued until Fiscal Years and Currency are Closed; its eventual live
gate must revalidate Accounts `P-002`, Hierarchy Levels `P-001`, and independent
Arabic/English business-name parity on both Web and Mobile.
