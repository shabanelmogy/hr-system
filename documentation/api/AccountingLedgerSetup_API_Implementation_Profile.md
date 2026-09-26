# Accounting Ledger Setup — API Implementation Contract

Status: **Phase 01 API/Domain and persistence migration implemented; client slices and final verification remain in progress.**

## 1. Scope and current baseline

Extend the existing Accounting modular-monolith slice. Reuse
`AccountingDbContext`, schema `acc`, `IAccountingUnitOfWork`, tenant/company
filters, RowVersion, module authorization and Fiscal Years. Do not create a second
Accounting service stack or generic CRUD service.

Future Slice 1 execution is decomposed by
`documentation/plans/business/accounting-core-gl/SLICE-01-LEDGER-SETUP-EXECUTION.md`.
Each child package owns typed request/response/lookup/error contracts and must pass
its API-readiness gate before its Screen Contract is considered complete. The
umbrella route inventory below does not authorize a generic resource DTO or generic
resource-switching service.

## 2. Domain model

Accounting-owned `Currency`, `AccountingCompanySettings`,
`AccountHierarchyLevel`, `Account`, `DimensionDefinition`,
`DimensionValue`, `Book`, Journal definition/numbering configuration,
`ExchangeRateType`, `ExchangeRate`, `AccountMapping`, and `PostingProfile`.

JournalEntry/JournalLine/PostingReceipt and Month Close runtime are later slices.

Every named master has separate required `NameAr` and `NameEn` in domain state,
request/response/detail/list contracts, validation, persistence columns and
search/sort vocabulary where names are searchable: Fiscal Year/Period when named,
Currency, AccountHierarchyLevel, Account, DimensionDefinition, DimensionValue,
Book, JournalDefinition, ExchangeRateType and PostingProfile. The API never derives
one language from the other. `AccountingCompanySettings`, `ExchangeRate`,
`AccountMapping` and resolve-preview results have no authored business name and
must not receive fake name columns; projections may return localized referenced
owner labels without transferring write ownership.

## 3. Scope, authorization, and permissions

All operations fail closed without current tenant/company context. Request DTOs do
not contain TenantId/CompanyId.

Slice 1 permissions:

- Accounts: `Accounts:View/Create/Edit/Archive/Restore`
- Hierarchy levels: `AccountHierarchyLevels:View/Create/Edit/Archive/Restore`
- Dimension definitions: `DimensionDefinitions:View/Create/Edit/Archive/Restore`
- Dimension values: `DimensionValues:View/Create/Edit/Archive/Restore`
- Account dimension policies: `AccountDimensionPolicies:View/Edit`
- Settings: `AccountingSettings:View/Edit`
- Currency, Book, Journal, Exchange-rate type, Exchange-rate, Account-mapping, and Posting-profile endpoints use their own exact resource/action claim from the canonical permission catalog.

Journal definition mutations use the corresponding `JournalDefinitions:Create/Edit/Archive/Restore` claim; Slice 2 lifecycle
permissions are not activated merely because their names exist in the master plan.

## 4. CQRS and HTTP surface

Each route family has dedicated commands/queries, validators, ports and thin
`ISender` controllers:

- currencies
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

Lifecycle completeness is explicit per entity:

| Entity | Lifecycle contract |
| --- | --- |
| AccountHierarchyLevel, Account, DimensionDefinition, DimensionValue, Currency, Book, JournalDefinition, ExchangeRateType | archive/restore, RowVersion and archived discovery; parent/dependency references block archive |
| AccountingCompanySettings | singleton save/update only; archive is not a valid business operation |
| AccountDimensionPolicy | upserted account/definition relationship; no independent archive identity |
| ExchangeRate | effective/versioned financial history; no destructive archive endpoint |
| AccountMapping, PostingProfile | effective-dated/versioned determination rules; no destructive archive endpoint |

All mutations that can race over a parent, dependency or business key acquire the
same company-scoped atomic resource as the competing mutation. This includes
account/level/dimension policy, book/settings/journal/determination, and
currency/FX paths.

Archived master-data business keys remain reserved. Command-side duplicate
checks therefore match the database unique constraints and prevent historical
accounting identities from being reassigned.

## 7. Persistence and migration

Use `AccountingDbContext` and `acc` only. Add company-scoped unique/composite
indexes and RowVersion to mutable roots. No cross-module FK/navigation is allowed.
The EF-generated `20260922091842_InitialAccounting` migration is the clean
development baseline for the complete current Accounting model under `acc`. It has
passed no-pending-model plus clean SQL Server apply/idempotency verification. Any
development database carrying the superseded Accounting migration history must be
reset before this baseline is applied; no compatibility SQL is maintained.

The clean development baseline creates `acc.Currencies`; HR has no Currency
table/entity and retains only CurrencyCode snapshots validated through the
Accounting catalog. `AccountingCompanySettings` owns
FunctionalCurrencyId/PrimaryBookId. There is no HR `ExchangeRateToDefault` or
`IsDefault` financial policy.

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

Ledger Setup user-facing errors are localized through an Accounting-owned port
and embedded EN/AR resources. Process-wide `IStringLocalizerFactory` composition
is owned by `ErpSystem.Api`; no business module may replace it. The architecture
suite enforces this extraction-safe boundary.

Race-safe uniqueness maps to deterministic conflict outcomes. Setup correctness
does not depend on realtime/notifications; those are Deferred for this slice.

## 10. Verification

Required API evidence includes domain invariant tests, lifecycle/dependency tests,
company-isolation tests,
permission/controller contract tests, CQRS handler tests, migration/model tests,
clean-baseline Currency ownership tests, bilingual contract/persistence tests,
concurrency/uniqueness tests, account
resolution tests, module-definition tests and no-pending-model verification.

Build/test commands and exact counts are recorded in Phase 06, not invented here.

Every new feature/module must complete the generated entity lifecycle matrix in
`FEATURE-QUALITY-GATE.md`; a successful build alone is not completion evidence.

API evidence also prepares, but never replaces, each step's manual user gate. The
feature-specific scenario derived from
`documentation/plans/business/accounting-core-gl/MANUAL_ACCEPTANCE_SCENARIO_TEMPLATE.md`
must exercise authenticated permission subsets, read-only mode, tenant/company
isolation, validation/dependency rules, RowVersion conflicts, atomic failure, and
the exact live data consumed by Web and actual-device Mobile. Phase 06 remains open
until the user explicitly accepts the combined scenario result.

## 11. Deferred and excluded API work

Deferred/excluded from Slice 1: JournalEntry create/submit/approve/post,
PostingReceipt runtime, GL/TB queries, independent period close/reopen,
opening balances, AP/AR, bank/payment master creation, bulk setup import,
realtime/notifications and statutory/localization-specific accounting behavior.
