# Accounting Ledger Setup — Cross-Platform Implementation Contract

Status: **Phase 00 execution contract — runtime target not implemented yet**.  
Plan: `accounting-core-gl` / `Slice 1 — Ledger setup spine`.  
Applied implementation reference: Fiscal Years in the same Accounting module.

## 1. Scope, authority, and current/target boundary

The approved slice establishes the Accounting setup spine only: Currency ownership,
company accounting settings, Chart of Accounts, configurable hierarchy levels,
dimensions, one primary Book, Journal definitions/numbering, historical FX, Link
Accounts, and Posting Profiles including resolution preview. API, Web, Mobile,
migrations and tests are Required.

`VERIFIED CURRENT`: Accounting already owns the `acc` schema, module DbContext,
Inbox/Outbox, PartyReference projection, permissions infrastructure and the complete
Fiscal Years vertical slice. Ledger Setup entities/routes/screens do not yet exist.

`AUTHORIZED TARGET`: all Ledger Setup capabilities described here. JournalEntry
workflow/posting, GL/TB, independent Month Close, opening balances and subledgers are
not Slice 1 runtime work.

## 2. Existing-system relationship and reuse

This is an **Extend + Change + Add** change to the existing Accounting bounded
context, never a new financial module. Fiscal Years is reused unchanged as the
calendar/period authority. `AccountingDbContext`, `IAccountingUnitOfWork`,
company/tenant scoping, RowVersion conventions and module-owned permissions are
reused.

The existing HR Organizational Structure Currency master is a transitional owner.
Earlier Geography/Countries authority reserved financial Currency ownership for
Finance/Payroll when that bounded context existed. Slice 1 performs one coordinated
ownership move into Accounting; it does not create a second Currency master.

Branch and CostCenter remain HR-owned. Contacts remains owner of Party. External
references are consumed through stable Contracts/projections only; no cross-module
DbContext access, EF navigation or foreign key is permitted.

## 3. Target domain and company setup

Accounting adds these company-scoped concepts:

- `Currency`: ISO code, bilingual names, symbol, active/archive state and audit.
- `AccountingCompanySettings`: one row per company with
  `FunctionalCurrencyId`, `PrimaryBookId` and RowVersion.
- `AccountHierarchyLevel`: ordered company level, bilingual name and `CanPost`.
- `Account`: code, names, parent, hierarchy level, `AllowPosting`,
  `ManualPostingPolicy`, `CurrencyPolicy` and optional specific currency.
- `DimensionDefinition`: code/name, Required/Optional/Forbidden policy metadata
  and typed value source.
- `DimensionValue`: Accounting-owned value or validated typed external reference.
- `Book`: company ledger book; exactly one Primary Book in V1.
- `Journal`: definition/category/numbering configuration attached to a Book.
- `ExchangeRateType` and `ExchangeRate`: historical effective/versioned series.
- `AccountMapping`: typed, effective direct purpose mapping used by Link Accounts.
- `PostingProfile`: effective/versioned conditional account-resolution rules.

Account code is proposed by the server but remains editable when it satisfies the
configured hierarchy/code rules and company uniqueness.

## 4. Business rules and lifecycle

Posting eligibility requires both the configured hierarchy level to allow posting
and `Account.AllowPosting=true`; a posting account cannot have children.
`ManualPostingPolicy` is Allowed/Restricted/Blocked.
`CurrencyPolicy` is Any/FunctionalOnly/SpecificCurrency.

Used financial configuration is archived/versioned rather than destructively
deleted. All important writes use RowVersion and current tenant/company from the
trusted actor, never request scope fields.

The company has one Functional Currency and one Primary Book in V1.
`AccountingCompanySettings` owns those selections; neither is inferred from code,
account prefixes, HR's former `Currency.IsDefault`, or UI state.

Dimensions are typed and do not form a generic EAV API. A value source is exposed
only when Accounting has a real adapter/Contract to the owning master.

## 5. Account determination and cross-module ownership

Link Accounts and Posting Profiles are two UX levels over one deterministic
account-determination model. Resolution uses purpose, effective date, typed context,
specificity and priority. Zero winners blocks; equal winning rules block as
ambiguous. There is no suspense/random fallback.

Company-purpose direct mappings are available in Slice 1 and are sufficient to
configure a valid first posting context. BankAccount, PaymentMethod, Cashbox/Safe,
ContactGroup and PartyRole source-specific mapping types are not exposed until the
owning master/Contract exists. No placeholder master or fake FK is created.

HR Branch/CostCenter references and future source masters are stable IDs through
owner Contracts/projections. Contacts Party projection remains existing Accounting
integration and is not required for manual GL setup.

## 6. Persistence, API, and migration contract

All new Accounting tables live in `acc`, use tenant/company filtering and
race-safe company/business-key indexes. Mutating aggregate roots use RowVersion.
The existing FiscalYears/FiscalPeriods tables are untouched except for additive
integration if required.

Target route families are:

- `/api/v1/accounting-currencies`
- `/api/v1/accounting-settings`
- `/api/v1/accounts`
- `/api/v1/accounting-dimensions`
- `/api/v1/accounting-books`
- `/api/v1/accounting-journals` (definition/setup only)
- `/api/v1/accounting-exchange-rate-types`
- `/api/v1/accounting-exchange-rates`
- `/api/v1/account-mappings`
- `/api/v1/posting-profiles` and `resolve-preview`

Controllers are thin `ISender` endpoints; handlers depend on narrow ports.

Currency migration copies existing company Currency records into `acc.Currencies`
while preserving company + ISO code and metadata, switches Web/Mobile/HR consumers
to the Accounting currency surface, then removes the HR-owned writable Currency
table/resource. The old single `ExchangeRateToDefault` is not retained as the
financial FX authority; historical Accounting rates replace it.

## 7. Web and Mobile product contract

Web adds first-class Finance setup routes for Accounts and Accounting Setup.
COA uses `SplitTreeView` / `HierarchicalTreeList`; lists use `MyDataGrid`;
forms use `MyForm` and shared fields/dialogs/feedback. Search/filter/sort for
potentially large lists is server-owned.

Mobile uses `AppHierarchicalTree`, `AppListScreen`, `AppDataTable`,
`AppForm`, `AppPageHeader`, `AppStateView` and `ConfirmationDialog`.
Financial setup mutation is online-authoritative. Cached/offline financial writes
are not part of Slice 1.

Both clients implement English/Arabic, RTL/LTR, permission/read-only behavior,
accessible validation and responsive/touch layouts from existing shared systems.

## 8. Delivery phases and verification

Phase 00 freezes this contract and current evidence before coding. Phases 01–05
implement Domain/API, Web, Mobile, domain actions and integration/runtime. Each
phase updates these applied books and `required-files.json` with actual source
evidence.

Phase 06 must reconcile every Required target here against runtime and return
`Verified` or `Not Verified`. A feature regression or missing Required behavior
cannot be accepted as a release note.

Only after `Verified` may Phase 07 create/finalize
`documentation/plans/business/accounting-core-gl/education/accounting-ledger-setup.md`.

## 9. Risks, drift, and migration safeguards

Current confirmed drift:

- Currency is temporarily owned by HR although canonical design reserved the
  financial master for Finance/Payroll.
- Accounting architecture previously attributed Branch ownership to Platform;
  runtime proves HR Organizational Structure owns Branch/CostCenter.
- several Link Account source masters named by the long-term business design do not
  exist yet.

Safeguards:

- one writable Currency master at every completed deployment state;
- migration preserves ISO code/company business identity and is rehearsed/tested;
- no current Fiscal Years reconstruction;
- no implicit statutory COA seed;
- no source-specific account-mapping option without a validating owner Contract;
- production scale and jurisdiction decisions remain G4/release gates, not Slice 1
  excuses to invent behavior.

## 10. Phase 00 handoff

Phase 00 is ready to close when the implementation request/review artifact contain
no unresolved placeholders, these four applied implementation books exist, the
preflight required-file manifest is registered, generated Phase 00 is current, and
planning/documentation/architecture gates pass.

The first runtime change after that gate is the Accounting-owned setup model and
Currency ownership migration—not JournalEntry/posting runtime.

