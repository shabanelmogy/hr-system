# Accounting Chart of Accounts and Hierarchy Implementation Request

## Request metadata

| Field | Value |
| --- | --- |
| Feature | `Accounting Chart of Accounts and Hierarchy` (`ledger-setup-coa-hierarchy`) |
| Operating mode | Existing-feature refactor and contract completion |
| Plan ID | `accounting-core-gl` |
| Authorized slice | `Slice 1 — Ledger setup spine` / child `1B` |
| Canonical plan | `documentation/plans/business/accounting-core-gl/PLAN.md` |
| Decomposition decision | `Decompose` |
| Screen/Workflow Contract | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-coa-hierarchy.md` |
| Applied reference | `organizational-structure` for interaction composition only |
| Owning module | Accounting |
| Module architecture | `documentation/modules/accounting/ARCHITECTURE.md` |
| API applied profile | `documentation/api/LedgerSetupCoaHierarchy_API_Implementation_Profile.md` |
| Web applied profile | `documentation/web-next/features/ledger-setup-coa-hierarchy-frontend-reference.md` |
| Mobile applied profile | `documentation/mobile-react/ledger-setup-coa-hierarchy-mobile-reference.md` |
| Review artifact | `documentation/system/features/ledger-setup-coa-hierarchy/LEDGER_SETUP_COA_HIERARCHY-REVIEW-ARTIFACTS.md` |
| Required files | `documentation/system/features/ledger-setup-coa-hierarchy/required-files.json` |
| Customer education target | `documentation/plans/business/accounting-core-gl/education/ledger-setup-coa-hierarchy.md` after Phase 06 Verified |

## Execution request

Refactor the existing Account/Hierarchy Ledger Setup surface into one canonical
typed child feature without compatibility façades or duplicate ownership. Preserve
the existing correct Account/AccountHierarchyLevel domain rules and database model,
complete the missing read/transport contracts, and keep the focused typed Web/Mobile
implementations aligned with the shared form contract.

Do not delete the umbrella Ledger Setup generic client while sibling child features
still consume it. The COA routes themselves must stop consuming that generic runtime
when this child is complete.

## Approved product decisions

| Concern | Decision |
| --- | --- |
| Ownership and scope | Accounting owns Account and AccountHierarchyLevel; tenant/company come only from `ICurrentActor`. |
| Hierarchy identity | `ParentAccountId` + `AccountHierarchyLevelId`; Account Code never implies hierarchy. |
| Account fields | Code, NameAr, NameEn, hierarchy level, optional parent, AllowPosting, ManualPostingPolicy, CurrencyPolicy, optional SpecificCurrencyId, archive/audit state and RowVersion. |
| Level fields | positive company-unique LevelNumber, NameAr, NameEn, CanPost, archive/audit state and RowVersion. |
| D-024 code proposal | Server proposes editable company-wide non-hierarchical `ACC-####` using the next reserved numeric suffix across active + archived codes. Proposal is not a reservation. |
| Permissions | `Accounts:View` for reads; `Accounts:Manage` for writes. Global read-only suppresses client mutations. |
| Account list | Real server page envelope; search fields `all|code|nameAr|nameEn`; operators `contains|doesNotContain|equals|doesNotEqual|startsWith|endsWith`; status `active|archived|all`; sort allow-list `code|nameAr|nameEn|createdOn`; deterministic ID tie-break; bounded page size. |
| Tree/detail/lookup | Active complete tree; full versioned detail before protected action; active lookup for selectors. |
| Level list | Deterministic LevelNumber/Id ordering with active/archived/all discovery; expected set is small, so a bounded typed list is acceptable. |
| Web | Required focused COA master/detail tree and focused Hierarchy Levels list/form. Cards, chart, report, import/export are Excluded for this child. |
| Mobile | Required touch tree + detail/form and focused Hierarchy Levels list/form. Cards are Excluded for COA; no desktop split-pane imitation. |
| Dimensions | Account dimension policy UI is owned by sibling `ledger-setup-dimensions`; 1B leaves a typed composition seam only. |
| Drag/reparent | Excluded until an Accounting-owned reparent contract is explicitly approved. |
| Reporting/import | Excluded from 1B; no placeholder route or control. |
| Realtime/notifications | Deferred; correctness depends on authoritative refetch/invalidation, not delivery. |
| Offline writes | Excluded. All financial setup writes require live server authorization/concurrency. |

## Existing-System Relationship Review

| Concern | Decision |
| --- | --- |
| Owning capability | Existing Accounting Ledger Setup Account/Hierarchy capability under `api/Modules/Accounting`. |
| Relationship classification | Change/extend the current owner; do not create parallel aggregates, tables, services or routes. |
| Existing behavior retained | Domain hierarchy/posting/currency invariants, archive/restore, RowVersion, company filters, current table/index/FK model, route family and permissions. |
| Existing behavior replaced | Array-only Account page contract; missing code proposal; generic Web/Mobile Account/Hierarchy renderer on the COA routes. |
| Existing path disposition | Existing API routes remain canonical and evolve additively except the Account list response shape consumed by in-repo clients in the same delivery. |
| Evidence | Account/Level entities, SettingsAndAccountsCommands, LedgerSetupQueries/Stores, AccountsController, LedgerSetupConfigurations, module tests; Web SplitTreeView/CostCenterTreeDiagram/Currencies; Mobile AppHierarchicalTree/Currencies. |

### Ownership, contracts, and reuse inventory

| Item | Owner/source | Decision |
| --- | --- | --- |
| Domain rules | Accounting Domain `Finance/LedgerSetup/Entities/Account*.cs` | Reuse; extend only if target invariant is missing. |
| Persistence | `AccountingDbContext` + LedgerSetupConfigurations/Stores | Reuse/extend read projection; no new table expected. |
| Currency dependency | Accounting-owned Currency lookup | Reuse typed public/client surface; no HR Currency dependency. |
| Web tree | `src/shared/components/tree-view/SplitTreeView` | Reuse directly, including detail-panel contract. |
| Web closest composition | CostCenterTreeDiagram | Reuse interaction pattern only; reject HR domain fields, permissions and move logic. |
| Web list/forms | MyDataGrid, MyForm, shared fields/dialogs/feedback, useServerListState | Reuse. |
| Mobile | AppHierarchicalTree, AppListScreen/AppDataTable, AppForm, shared state/feedback | Reuse. |
| Generic Ledger Setup renderer | current umbrella clients | Reject as target for Accounts/Hierarchy; keep only for untouched sibling features until their own child refactors. |

## Mandatory Business Readiness Gate

### Business Rules Matrix

| ID | Business rule | Owner | Stable outcome | Required test |
| --- | --- | --- | --- | --- |
| COA-001 | Tenant/company scope is trusted and mandatory. | Application + DbContext | missing scope fails closed | handler/isolation |
| COA-002 | Account code normalizes uppercase and is company-unique; archived codes stay reserved. | Domain + DB | validation/409 duplicate | create/update/restore + unique race |
| COA-003 | D-024 proposal is next reserved `ACC-####`, editable and non-reserving. | Application read query + DB final authority | deterministic proposal; duplicate create may 409 | proposal/gap/archive/race |
| COA-004 | Hierarchy level number is positive and company-unique. | Domain + DB | validation/409 duplicate | level create/update/race |
| COA-005 | Posting Account requires level CanPost and no children. | Domain + Application | invalid hierarchy | create/update |
| COA-006 | Posting Account cannot accept a child. | Domain + Application | invalid hierarchy | add-child |
| COA-007 | Account cannot parent itself or create a cycle. | Application persisted-state check | invalid hierarchy | cycle tests |
| COA-008 | Parent, level and specific Currency must be active same-company references. | Application + composite FK | validation/not-found semantics | handler/isolation |
| COA-009 | SpecificCurrencyId is required only for SpecificCurrency policy and absent otherwise. | Domain | stable domain validation | domain/handler |
| COA-010 | Used/referenced Account and referenced hierarchy levels cannot be archived. | Application | 409 in-use | lifecycle |
| COA-011 | Protected update/archive/restore requires current RowVersion. | Application + EF concurrency | 409 concurrency | stale writer |
| COA-012 | Tree is built from parent relation and contains only permitted active accounts. | Read projection | deterministic tree | query |
| COA-013 | Account list totals/search/status/sort/paging are server-owned and truthful. | Read projection | PageResponse metadata | query/service tests |

### Edge Cases & Validation Matrix

| Category | Scenario | Expected behavior | Outcome | Layer | Test |
| --- | --- | --- | --- | --- | --- |
| Input shape | blank/oversize names/code, invalid enums/IDs/RowVersion | reject before mutation | 400 | FluentValidation | validator |
| Normalization | mixed-case/space Account code | trim + uppercase | normalized key | Domain/Application | domain/create |
| Duplicate/race | same company code by competing writers | DB allows one only | 409 duplicate | App + DB | integration/metadata |
| Relationships | archived/missing parent, level or Currency | reject | validation/404-style stable error | Application | handlers |
| Scope | foreign-company ID/reference | unavailable; no cross-company mutation | fail closed | filters/Application | isolation |
| Permission | missing View/Manage | API rejects; client hides/guards | 403 | Presentation/client | controller/client |
| Lifecycle | archive referenced Account/Level | block and retain history | 409 in-use | Application | lifecycle |
| Concurrency | stale update/archive/restore | no overwrite | 409 | EF/Application | concurrency |
| Proposal | no ACC codes, gaps, archived codes, large suffix | next reserved numeric suffix; no reuse | typed proposal | read store/query | proposal tests |
| Proposal race | two clients receive same proposal | proposal remains valid hint only; one create may conflict | 409 + refetch | DB/client | race/client |
| Transaction | failure before SaveChanges | no partial Account/Level state | operation fails | UoW | handler fault where practical |
| Post-commit effects | N/A: no correctness-critical external side effect in 1B | commit remains authority | N/A | N/A | absence documented |
| Paging/query | invalid page/operator/sort or large set | validate allow-list; bounded deterministic page | 400/page envelope | validator/read store | query tests |
| Money/UOM | N/A: no amount or quantity in 1B | N/A | N/A | N/A | documented |
| Dates/periods | N/A: COA setup has no effective-date/fiscal transition | N/A | N/A | N/A | documented |
| Bulk/import | N/A: Excluded | no endpoint/client placeholder | N/A | scope | architecture absence |
| Integrations | Currency lookup is Accounting-local; Dimensions deferred sibling | typed dependency only | no duplicate owner | contracts | integration tests as needed |
| Files/security input | N/A: no file surface | no upload path | N/A | scope | documented |
| Compatibility | in-repo Account list clients move to PageResponse in same delivery | no permanent adapter | build/type tests green | all clients | contract tests |
| Cancellation/failure | cancelled read/write propagates token and commits nothing before success | cancelled/failed | stable pipeline | Application/Infra | focused test where practical |
| Scale | Account list paged/indexed; tree is bounded company hierarchy | no N+1/unbounded paged list | measurable bounded query | Infrastructure | query inspection/test |

### Impact Matrix

| Area | Decision | Existing artifact | Required change | Evidence |
| --- | --- | --- | --- | --- |
| Domain | Reuse | Account, AccountHierarchyLevel | retain canonical invariants | domain tests |
| Application/CQRS | Change | LedgerSetupQueries + account commands | PageResponse criteria + D-024 proposal; validator parity | module tests |
| Infrastructure | Extend | LedgerSetupStores | server paging/filter/sort/count + proposal projection | query tests |
| Persistence schema | Reuse | acc.Accounts/AccountHierarchyLevels | no migration expected | no-pending-model |
| Presentation | Extend | AccountsController | typed page + `code-proposal` GET | controller test |
| Permissions | Reuse | AccountingPermissions Accounts View/Manage | no new permission | permission tests |
| Scope | Reuse | current actor + DbContext filters | no request scope | isolation |
| Integration | Reuse | Accounting Currency | typed lookup only | client/API tests |
| Jobs/realtime/cache | N/A/Deferred | existing client query caches | invalidate/refetch only | client tests |
| Module tests | Extend | ErpSystem.Modules.Accounting.Tests | proposal/page/validator/controller cases | focused suite |
| Architecture tests | Extend only if needed | ErpSystem.ArchitectureTests | guard generic ownership/no parallel path if useful | architecture suite |
| Web | Change | generic LedgerSetup Account/Level routes | child-owned typed services/hooks/pages/components | type/focused tests |
| Mobile | Change | generic LedgerSetup Account/Level routes | child-owned typed layered feature | type/focused tests |
| Documentation | Extend | this child package | add runtime evidence as created; regenerate | planning/docs checks |

## Import and reporting contracts

Import is **Excluded on Web and Mobile** for 1B. Reporting/export is **Excluded**.
No parser, upload, template, export button, report dataset, placeholder route or hidden
flag is created by this child.

## Required implementation

API must add the D-024 proposal query and real Account page contract while preserving
the canonical domain/persistence owner. Web must replace Accounts and Hierarchy Levels
generic routes with typed child pages and a Cost Center-style SplitTreeView
master/detail composition. Mobile must replace the same two generic routes with typed
runtime schemas/repository/use-cases/hooks/screens using AppHierarchicalTree.

## Offline and synchronization

| Capability | API | Web | Mobile | Decision |
| --- | --- | --- | --- | --- |
| Cached read | authoritative online | query cache only | Deferred beyond normal query cache | no approved offline financial setup policy |
| Local draft/write | N/A | Excluded | Excluded | server confirmation required |
| Sync/outbox client write | N/A | Excluded | Excluded | no synthesized success |
| Connection for mutation | Required | Required | Required | permissions/concurrency server-owned |
| Recovery | authoritative refetch | refetch on 409/uncertain response | refetch on 409/uncertain response | no queued mutation |

## Local mock-data contract

Every writable Account and Hierarchy Level form exposes the shared Web `MyForm` or
Mobile `AppForm` mock-data action when authoritative prerequisites are loaded. It fills
a realistic, schema-valid local draft only and never submits, persists, fabricates IDs,
RowVersion, tenant/company scope, posting or authorization state. Account mock data
keeps the server-proposed code, uses an active loaded hierarchy level, keeps only a
valid contextual non-posting parent, and selects a real Currency lookup only. Hierarchy
Level mock data selects the next positive number unused by active or archived loaded
levels and bilingual sample names. View-only and
query/report-only surfaces are N/A. This is a local-draft aid, not offline mutation.

## Verification and handoff

Phase 00 closed for the child contract on 2026-09-22. API Phase 01 and typed Web/Mobile
client phases are implemented and focused/static checks are recorded in the review
artifact; live API-backed Phase 06 remains the only path to `Verified`. Phase 07
education starts only after that decision.
