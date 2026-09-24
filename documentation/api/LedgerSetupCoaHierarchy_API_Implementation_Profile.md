# Accounting Chart of Accounts and Hierarchy — API Implementation Contract

Status: **Phase 01 API contract implemented and focused-tested; typed Web/Mobile clients consume it, with live Phase 06 acceptance pending.**

## 1. Boundary and current baseline

The implementation extends the existing Accounting Ledger Setup owner in `acc`; it
does not create generic CRUD services, a second persistence owner, or a new module.
The existing Account/Hierarchy domain and persistence model remain authoritative.

## 2. Domain model

`AccountHierarchyLevel` owns positive level number, bilingual names and `CanPost`.
`Account` owns editable code, bilingual names, level, optional parent, `AllowPosting`,
manual-posting policy, currency policy and optional specific Currency. Hierarchy is
parent + level identity, never code prefix.

## 3. Scope, authorization, and permissions

Tenant/company come only from `ICurrentActor`; request DTOs never author scope.
Read endpoints require `Accounts:View`; create/update/archive/restore require
`Accounts:Manage`. Missing scope fails closed. Cross-company references are unavailable.

## 4. CQRS and HTTP surface

Thin `ISender` endpoints remain under `/api/v1/accounts`: Account
list/tree/lookup/detail, Hierarchy Level list/create/update/archive/restore, and Account
create/update/archive/restore. D-024 is implemented as
`GET /api/v1/accounts/code-proposal` under the same route family with
`Accounts:View`; the value is server-owned and not hidden behind a generic setup
controller or client generator.

## 5. Read contracts

The Account list now returns `PageResponse<AccountResponse>` with
`pageNumber/pageSize/search/searchField/searchOperator/recordStatus/sortBy/sortDirection`.
Search fields are `all|code|nameAr|nameEn`; operators are
`contains|doesNotContain|equals|doesNotEqual|startsWith|endsWith`; statuses are
`active|archived|all`; sortable fields are `code|nameAr|nameEn|createdOn`.
Ordering always has an ID tie-break and metadata contains the real server-side total.
Tree remains the complete permitted active hierarchy, detail remains the full versioned
Account, and lookup remains active-only for selectors.

## 6. Write contracts and invariants

Create/update normalize code to uppercase, enforce company uniqueness, validate active
level/parent/Currency, prevent parent cycles, prevent children under posting Accounts,
and require level `CanPost` when Account `AllowPosting=true`. Specific Currency is
required/forbidden according to policy. Archive blocks children/references; restore
revalidates dependencies. Updates/lifecycle use RowVersion.

## 7. Persistence and D-024 proposal

Preserve the existing unique indexes on `(TenantId, CompanyId, LevelNumber)` and
`(TenantId, CompanyId, Code)` and same-company restrictive FKs.

D-024 proposal is implemented company-wide and non-hierarchically: the read store
inspects active + archived Account codes with an `ACC-` prefix and a numeric suffix of
at least four digits, chooses the highest reserved suffix plus one, and formats the
convenience proposal with a minimum width of four digits. Archived codes therefore
remain reserved and values beyond `ACC-9999` continue monotonically. The proposal does
not reserve a row or lock future callers and remains editable.

Account mutations already execute behind the company-scoped Accounting SQL application
lock and pre-check the company-unique code. The existing DB unique index remains the
final invariant authority. A competing in-module create therefore resolves to the
stable `Accounting.Account.Duplicate` conflict after serialization; the host also
maps SQL Server unique violations (2601/2627) to a stable 409
`UniqueConstraintViolation` instead of leaking provider exceptions.

## 8. Integration boundaries

Specific Currency uses the existing Accounting-owned Currency data/lookup. Dimensions
compose later through child `ledger-setup-dimensions`; this child must expose a typed
Account composition seam but must not absorb dimension workflows. No cross-module EF navigation.

## 9. Errors, concurrency, and effects

Use Accounting-owned localized stable problems for scope required, not found,
duplicate, invalid reference, invalid hierarchy, in-use and concurrency. Database
unique violations close race windows and must not leak provider exceptions. No
notification/realtime delivery is correctness-critical in this child.

## 10. Verification

Phase 01 focused runtime evidence on 2026-09-22 was
`dotnet test Modules/Accounting/ErpSystem.Modules.Accounting.Tests/ErpSystem.Modules.Accounting.Tests.csproj -c Release --no-restore`
with **56/56 PASS**. The same complete Accounting suite was revalidated on 2026-09-23
with **66/66 PASS** after the typed client/mock-data reconciliation. The COA tests cover truthful page metadata and focused search,
negative search behavior, D-024 empty/active/archived/large-suffix behavior, frozen
query vocabulary, hierarchy-level update-validator parity, and controller/permission
surface. Existing lifecycle/domain tests continue to cover create/update/archive/
restore, posting and hierarchy rules. No persistence model changed in Phase 01, so no
feature migration was introduced.

Additional verification keeps the persistence/race boundary explicit: the focused
global exception-handler theory passes **2/2** for SQL unique error numbers 2601/2627,
and the repository-wide EF pending-model check passes **1/1**. The current Architecture
suite passes **58/58** on 2026-09-23, including the migration WhatIf assertion.

## 11. Deferred and excluded API work

Excluded here: generic EAV, JournalEntry/posting, GL/TB, independent Month Close,
bulk/import, report datasets, custom reparent endpoint/DnD, hierarchy-derived codes,
client code generation and a separate code-sequence owner. Reopen only through the
canonical plan if product meaning changes.
