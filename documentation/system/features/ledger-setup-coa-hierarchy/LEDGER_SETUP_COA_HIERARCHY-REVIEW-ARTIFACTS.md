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
| Documentation state | Phase 00 Final; runtime target not yet claimed |
| Import | Excluded on Web and Mobile |
| Reporting/export | Excluded in 1B |
| Customer Education | Required only after Phase 06 Verified |

## Requirement manifest

| ID | Requirement | Current evidence | API target | Web target | Mobile target | State |
| --- | --- | --- | --- | --- | --- | --- |
| R-01 | Accounting owns Account + hierarchy | Domain/DbContext/routes exist | Preserve | Consume | Consume | Verified current |
| R-02 | D-024 server proposed editable Account code | API `code-proposal` implemented | Implemented | Fetch on create | Fetch on create | API verified; clients pending |
| R-03 | Truthful Account page criteria/totals | API PageResponse + frozen allow-lists implemented | Implemented | Use server total | Use server total | API verified; clients pending |
| R-04 | Account tree/detail/create/edit/archive/restore | API exists | Preserve/strengthen | Dedicated master/detail | Typed tree/detail | Open client target |
| R-05 | Hierarchy-level lifecycle | API exists; update name validation parity closed | Implemented | Focused list/form | Focused list/form | API verified; clients pending |
| R-06 | RowVersion before protected actions | Detail/lifecycle API exists | Preserve | detail fetch before write | detail fetch before write | Open client target |
| R-07 | No generic COA client runtime | Generic Web/Mobile currently used | N/A | Replace for COA routes | Replace for COA routes | Open target |
| R-08 | EN/AR, RTL, responsive/accessibility | shared systems exist | localized stable errors | verify | verify | Open target |

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
| E-03 | CQRS lifecycle exists | `SettingsAndAccountsCommands.cs`, `LedgerSetupLifecycleCommands.cs` | source + 56/56 Accounting suite |
| E-04 | Account page is server-owned and truthful | `LedgerSetupQueries.cs`, `LedgerSetupStores.cs`, `AccountsController.cs` | PageResponse + focused runtime tests |
| E-05 | D-024 server proposal exists | `GetAccountCodeProposalQuery`, `AccountReadStore.GetCodeProposalAsync`, `AccountsController.CodeProposal` | source + focused runtime tests |
| E-06 | Web uses generic `LedgerSetupRecord` renderer | `web-next/src/modules/accounting/ledger-setup/*` | source inspection |
| E-07 | Cost Center proves SplitTreeView master/detail composition | `CostCenterTreeDiagram.tsx` + shared SplitTreeView | source + shared tests |
| E-08 | Currency proves typed Accounting Web/Mobile vertical patterns | `web-next/src/modules/accounting/currencies`, `mobile-react/src/modules/accounting/currencies` | source/tests |
| E-09 | Mobile Account/Level routes currently use generic LedgerSetup screen | Expo route files + generic ledger-setup module | source inspection |

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
| Active | Accounts:View | Accounts:Manage when non-posting parent | Accounts:Manage | Accounts:Manage subject to dependencies | N/A |
| Archived | Accounts:View via status/detail | No | No | N/A | Accounts:Manage after revalidation |
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
| F-03 | High | Web Accounts reuses SplitTreeView without the approved master/detail composition | LedgerSetupResourcePage vs CostCenterTreeDiagram | Web | Phase 02 |
| F-04 | High | Web/Mobile COA still use catch-all generic record/renderers | current Ledger Setup clients | Web/Mobile | Phases 02–03 |
| F-05 | Medium | Update hierarchy-level validator lacked name length parity with create | validator + focused test | Accounting API | **Resolved Phase 01** |
| F-06 | Medium | Tree nodes omit RowVersion by design, so protected actions require detail refresh | tree/detail contracts | Clients | Preserve explicit detail-fetch rule |

## Verification baseline

| Layer | Check | Result | Date |
| --- | --- | --- | --- |
| Accounting module tests | `dotnet test ...ErpSystem.Modules.Accounting.Tests.csproj --no-restore --nologo` | 50/50 PASS before 1B runtime refactor | 2026-09-22 |
| Accounting Phase 01 tests | `dotnet test Modules/Accounting/ErpSystem.Modules.Accounting.Tests/ErpSystem.Modules.Accounting.Tests.csproj -c Release --no-restore` | 56/56 PASS after API page/proposal/validator implementation | 2026-09-22 |
| Unique-conflict host mapping | `dotnet test Tests/ErpSystem.IntegrationTests/ErpSystem.IntegrationTests.csproj -c Release --no-restore --filter FullyQualifiedName~GlobalExceptionHandlerTests.UniqueConstraintException_ReturnsStableConflictProblemDetails` | 2/2 PASS for SQL unique codes 2601/2627 → stable 409 | 2026-09-22 |
| Persistence model drift | `dotnet test Tests/ErpSystem.IntegrationTests/ErpSystem.IntegrationTests.csproj -c Release --no-restore --no-build --filter FullyQualifiedName~ModulePersistenceFoundationTests.EveryModuleDbContext_HasBaselineMigrationAndNoPendingModelChanges` | 1/1 PASS; 1B introduces no pending model change | 2026-09-22 |
| Architecture tests | `dotnet test ...ErpSystem.ArchitectureTests.csproj --no-restore --nologo` | 57 PASS / 1 environment failure: `pwsh` executable unavailable in migration WhatIf test | 2026-09-22 |
| Planning | `./documentation/plans/Check-Planning.ps1` | PASS — canonical planning checks clean | 2026-09-22 |
| Documentation — child recipes | eight `Generate-Documentation.ps1 -Recipe ledger-setup-coa-hierarchy-... -Check` calls | PASS — all 8 COA/Hierarchy packets current | 2026-09-22 |
| Documentation — repository global | `./documentation/system/Generate-Documentation.ps1 -Check` | PASS — 101 registered recipes current after concurrent Currency generation completed | 2026-09-22 |
| Manifest/contracts | recipe/required JSON parse + placeholder scan | PASS | 2026-09-22 |
| Diff | `git diff --check` scoped to planning/docs child change | PASS; line-ending notices only | 2026-09-22 |
| Web/Mobile runtime | Not yet verified for child target | Phase 06 responsibility | 2026-09-22 |

## Final reconciliation

Phase 00 decision: **READY FOR CODING — 2026-09-22** for
`ledger-setup-coa-hierarchy` only. The final manifest, four books, recipes and
generated child packets are complete; feature-scoped and repository-global planning/
documentation checks are green. This state does not claim the current generic clients
satisfy the target, does not mark Phase 06 Verified, and does not authorize customer
education yet.
