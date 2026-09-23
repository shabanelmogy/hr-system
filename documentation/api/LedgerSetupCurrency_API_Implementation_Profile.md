# Ledger Setup Currency — API Implementation Profile

## 1. Scope and ownership

Accounting owns Currency under Finance/Ledger Setup. This profile reconciles the
existing vertical slice to child `ledger-setup-currency`; it does not authorize a
second API. HR and future modules consume only public Accounting Contracts.

## 2. Domain model

`Currency` contains `Id`, normalized `CurrencyCode`, `NameEn`, `NameAr`, `Symbol`
plus inherited company/audit/soft-delete/RowVersion state. Domain guard owns required
identity and ISO-shaped code normalization. Functional currency and FX rates are not
Currency fields.

## 3. Persistence model

`AccountingDbContext.Currencies` maps to `acc.Currencies`. The initial Accounting
baseline owns the table, company-scoped alternate/foreign-key compatibility and the
unique `(TenantId, CompanyId, CurrencyCode)` index. RowVersion protects competing
writes. No HR Currency table or default-rate compatibility column is authoritative.

## 4. Read contract

`GetCurrenciesQuery` is one-based and bounded by the shared maximum page size.
Search fields are `all/currencyCode/nameAr/nameEn/symbol`; six string operators are
allowed; record status is `active/archived/all`; sorts are
`currencyCode/nameAr/nameEn/symbol/createdOn`. `CurrencyReadStore` returns real total
metadata and deterministic Id tie-break ordering. Detail includes archived records;
lookup returns active records only.

## 5. Write contract

Create takes code/names/symbol. Update adds Id + RowVersion. Archive and restore take
Id + RowVersion. Handlers derive tenant/company from `ICurrentActor`, fail closed
without trusted scope, use company catalog locking and commit through
`IAccountingUnitOfWork`. Duplicate code maps to `Currency.DuplicateCode`.

## 6. Lifecycle and invariants

Create is active; active update is allowed; archive soft-deletes; restore reactivates.
Archive is blocked if referenced by Accounting Company Settings, Accounts or Exchange
Rates and returns `Currency.InUse`. Repeated archive/restore are idempotent as
implemented. Archived currency is not eligible for active lookup/catalog consumers.

## 7. Transactions, locks, and audit

Create/update/archive/restore run inside the Accounting unit-of-work transaction and
the Currency company-catalog lock where required. Auditable soft-delete fields use
the current actor/time provider. RowVersion original value is applied for protected
mutations; concurrency conflict must never overwrite newer state.

## 8. HTTP surface and permissions

`CurrenciesController` is `[TenantMember]`, versioned at
`api/v{version:apiVersion}/currencies` and delegates only through `ISender`.
Page/lookup/detail require `AccountingSetup:View`; create/update/archive/restore
require `AccountingSetup:Manage`.

## 9. Errors and localization

Stable feature errors are `Currency.NotFound`, `Currency.DuplicateCode`,
`Currency.CompanyContextRequired` and `Currency.InUse`; shared concurrency mapping
supplies the 409 conflict outcome. Currency messages remain in Accounting-owned
localization. Validation errors own syntax/shape, while persisted/dependency decisions
remain in Application/Database.

## 10. Verification

Primary focused evidence is
`api/Modules/Accounting/ErpSystem.Modules.Accounting.Tests/CurrencyOwnershipTests.cs`,
plus solution architecture/integration ownership and baseline-migration tests. Required
scenarios include normalization, trusted scope, duplicate/race protection, dependency
archive block, archive/restore, active/company-isolated catalog, migration ownership,
thin controller/permissions and stale RowVersion.

Phase 06 verification on 2026-09-22 passed `14/14` Currency behavior tests, `2/2`
Currency ownership architecture tests, `1/1` clean-baseline migration test and
`31/31` focused HR consumer tests. The API also served the authenticated Web
create/edit/archive/restore/denial journey against the configured development
database without a Currency contract failure.

## 11. Deferred and next integration

Import, reporting, export and Currency-specific server notifications are Excluded
from this child. Company Settings consumes Currency later for Functional Currency;
Exchange Rates consumes Currency later for typed pairs/history. Those children must
not move their business rules into Currency during reconciliation.

Child `1A` is closed. Subsequent Currency consumers must preserve this public catalog
and ownership contract; integrated Slice 1 acceptance remains owned by package `1V`.
