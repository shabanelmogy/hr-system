# Accounting Ledger Setup — API Implementation Contract

Status: **Phase 00 target contract; Ledger Setup runtime is not implemented yet.**

## 1. Scope and current baseline

Extend the existing Accounting modular-monolith slice. Reuse
`AccountingDbContext`, schema `acc`, `IAccountingUnitOfWork`, tenant/company
filters, RowVersion, module authorization and Fiscal Years. Do not create a second
Accounting service stack or generic CRUD service.

## 2. Domain model

Add Accounting-owned `Currency`, `AccountingCompanySettings`,
`AccountHierarchyLevel`, `Account`, `DimensionDefinition`,
`DimensionValue`, `Book`, Journal definition/numbering configuration,
`ExchangeRateType`, `ExchangeRate`, `AccountMapping`, and `PostingProfile`.

JournalEntry/JournalLine/PostingReceipt and Month Close runtime are later slices.

## 3. Scope, authorization, and permissions

All operations fail closed without current tenant/company context. Request DTOs do
not contain TenantId/CompanyId.

Slice 1 permissions:

- `Accounts:View`
- `Accounts:Manage`
- `Dimensions:View`
- `Dimensions:Manage`
- `AccountingSetup:Manage`

Journal definition setup uses `AccountingSetup:Manage`; Slice 2 lifecycle
permissions are not activated merely because their names exist in the master plan.

## 4. CQRS and HTTP surface

Each route family has dedicated commands/queries, validators, ports and thin
`ISender` controllers:

- accounting-currencies
- accounting-settings
- accounts
- accounting-dimensions
- accounting-books
- accounting-journals (setup definitions only)
- accounting-exchange-rate-types
- accounting-exchange-rates
- account-mappings
- posting-profiles and posting-profiles/resolve-preview

Do not add a generic setup controller/service that switches on resource names.

## 5. Read contracts

COA read supports hierarchy/tree plus bounded search/detail/lookup. Setup
collections expose deterministic server filtering/sorting and bounded paging where
cardinality can grow. Lookup responses are intentionally small and active-only.

Every query is company-scoped and projects through read ports; controllers never
query EF directly. Resolution preview is read-only and returns resolved account or
explicit zero/ambiguous diagnostics with matched rule evidence.

## 6. Write contracts and invariants

Commands own one aggregate use case each. FluentValidation owns request shape;
Domain owns account hierarchy/posting/currency policies; Application owns
persisted-state, scope and cross-reference eligibility; database constraints close
uniqueness races.

Update/archive/restore/configuration writes use RowVersion. Posting accounts cannot
gain children. Used configuration archives or versions; destructive history
mutation is forbidden. Company settings remains a singleton.

## 7. Persistence and migration

Use `AccountingDbContext` and `acc` only. Add company-scoped unique/composite
indexes and RowVersion to mutable roots. No cross-module FK/navigation is allowed.

Move the existing HR company Currency master into `acc.Currencies` through a
coordinated data migration preserving company + ISO code and metadata. Introduce
`AccountingCompanySettings` for FunctionalCurrencyId/PrimaryBookId. Do not keep
HR `ExchangeRateToDefault` or `IsDefault` as parallel financial policy after
cutover.

## 8. Integration boundaries

Expose a stable Accounting Contracts currency catalog suitable for HR currency
selectors/validation. HR retains historical/business `CurrencyCode` snapshots.

Branch and CostCenter remain HR-owned; typed dimension/account-determination
adapters use HR Contracts/projections when required. Existing Contacts
PartyReference remains unchanged. Missing BankAccount/PaymentMethod/Cashbox/
ContactGroup/PartyRole owners do not produce fake adapters.

## 9. Errors, concurrency, and effects

Stable errors cover missing company, duplicate code, invalid hierarchy, posting
parent conflict, invalid currency policy, missing/inactive currency, invalid
dimension source, duplicate/effective FX, missing/ambiguous account mapping,
invalid company settings and concurrency conflict.

Race-safe uniqueness maps to deterministic conflict outcomes. Setup correctness
does not depend on realtime/notifications; those are Deferred for this slice.

## 10. Verification

Required API evidence includes domain invariant tests, company-isolation tests,
permission/controller contract tests, CQRS handler tests, migration/model tests,
Currency migration preservation tests, concurrency/uniqueness tests, account
resolution tests, module-definition tests and no-pending-model verification.

Build/test commands and exact counts are recorded in Phase 06, not invented here.

## 11. Deferred and excluded API work

Deferred/excluded from Slice 1: JournalEntry create/submit/approve/post,
PostingReceipt runtime, GL/TB queries, independent period close/reopen,
opening balances, AP/AR, bank/payment master creation, bulk setup import,
realtime/notifications and statutory/localization-specific accounting behavior.

