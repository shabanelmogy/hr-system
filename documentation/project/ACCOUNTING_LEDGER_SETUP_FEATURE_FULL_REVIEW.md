# Accounting Ledger Setup — Cross-Platform Implementation Contract

Status: **Broad Phase 01 Domain/API exists; Currency is typed with historical closure evidence, COA has typed clients through Phase 03, remaining clients require typed child refactors, and live Phase 06 remains gated by detailed per-step user acceptance**.
Plan: `accounting-core-gl` / `Slice 1 — Ledger setup spine`.  
Applied implementation reference: Fiscal Years in the same Accounting module.
Canonical child execution authority:
`documentation/plans/business/accounting-core-gl/SLICE-01-LEDGER-SETUP-EXECUTION.md`.

## 1. Scope, authority, and current/target boundary

The approved slice establishes the Accounting setup spine only: Currency ownership,
company accounting settings, Chart of Accounts, configurable hierarchy levels,
dimensions, one primary Book, Journal definitions/numbering, historical FX, Link
Accounts, and Posting Profiles including resolution preview. API, Web, Mobile,
migrations and tests are Required.

`VERIFIED CURRENT`: Accounting already owns the `acc` schema, module DbContext,
Inbox/Outbox, PartyReference projection, permissions infrastructure and the complete
Fiscal Years vertical slice. Ledger Setup domain entities, CQRS handlers, persistence
stores, versioned API controllers and the EF-generated
`20260922091842_InitialAccounting` clean baseline now exist under Accounting. The
migration has passed no-pending-model and clean SQL Server apply/idempotency checks;
client journeys and final Phase 06 verification remain gated.

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
- `Account`: code, distinct `NameAr`/`NameEn`, parent, hierarchy level, `AllowPosting`,
  `ManualPostingPolicy`, `CurrencyPolicy` and optional specific currency.
- `DimensionDefinition`: code, distinct `NameAr`/`NameEn`, Required/Optional/Forbidden policy metadata
  and typed value source.
- `DimensionValue`: code plus distinct `NameAr`/`NameEn`, or a validated typed external reference that preserves owner naming.
- `Book`: code plus distinct `NameAr`/`NameEn`; exactly one Primary Book in V1.
- `Journal`: definition with distinct `NameAr`/`NameEn`, category and numbering configuration attached to a Book.
- `ExchangeRateType`: code plus distinct `NameAr`/`NameEn`; `ExchangeRate` is historical effective/versioned data with no invented name field.
- `AccountMapping`: typed, effective direct purpose mapping used by Link Accounts.
- `PostingProfile`: code plus distinct `NameAr`/`NameEn` and effective/versioned conditional account-resolution rules.

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

### Entity completion matrix

| Entity | Create/read/update | Archive/restore | Archived discovery | Dependency/atomic rule |
| --- | --- | --- | --- | --- |
| AccountHierarchyLevel | Required | Required | `RecordStatus` | cannot archive while any Account references it; shares level/account resource |
| Account | Required | Required | `RecordStatus` | child/policy/mapping/profile references block archive; account resource shared by competing writes |
| DimensionDefinition | Required | Required | paged `RecordStatus` | active values or policies block archive; one dimension resource |
| DimensionValue | Required | Required | paged value `RecordStatus` | restore requires active definition and unique code |
| Currency | Required | Required | paged status | settings/account/rate references block archive; currency resource shared with all consumers |
| Book | Required | Required | `RecordStatus` | settings/journal/mapping/profile references block archive; shared book resources |
| JournalDefinition | Required | Required | paged `RecordStatus` | restore requires active Book and unique code; shared journal/book resources |
| ExchangeRateType | Required | Required | `RecordStatus` | any ExchangeRate history blocks archive; shared FX resource |
| AccountingCompanySettings | singleton save/read | N/A — configuration identity has no delete lifecycle | N/A | settings/book/currency resources |
| AccountDimensionPolicy | upsert/read | N/A — relationship policy | N/A | shares account/dimension resources |
| ExchangeRate | create/read/update | N/A — effective/versioned history | paged active effective series | shares currency/FX resources |
| AccountMapping / PostingProfile | create/read/update | N/A — effective dating/versioning | paged effective list/resolve preview | shares account/book/determination resources |

This matrix is a mandatory review gate. Future module scaffolds receive the same
matrix through `FEATURE-QUALITY-GATE.md`, and each blank cell blocks completion.

Archived master-data business keys stay reserved so a historical accounting
identity cannot be reused by a different record.

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

- `/api/v1/currencies`
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

The clean development baseline creates `acc.Currencies` directly and `InitialHr`
never creates `hr.Currencies`. There is no Currency copy, compatibility migration,
or backfill because the project has no customer data. Web/Mobile/HR consumers use
the Accounting currency surface. The old single `ExchangeRateToDefault` is not retained as the
financial FX authority; historical Accounting rates replace it.

## 7. Web and Mobile product contract

This document remains the umbrella cross-platform contract and historical evidence.
Future client implementation/refactoring follows the child Screen Contracts in
`SLICE-01-LEDGER-SETUP-EXECUTION.md`. The generic Ledger Setup record/renderer is
not the target architecture; child capabilities own typed contracts and focused
screen composition.

### Approved screen-pattern map

| Surface | Pattern | Web/Mobile contract |
| --- | --- | --- |
| Flat setup masters | `P-001` | Web Grid and Mobile Table/Cards only as each child marks Required |
| Accounts | `P-002` plus secondary P-001 list | Web split tree/detail; Mobile stacked/segmented hierarchy/detail |
| Account Dimension Constraints and Link Accounts | `P-006` | scoped relationship/mapping editor with explicit save/effective semantics |
| Company Settings | `P-005` | singleton editor, not a fake collection |
| Ledger Setup overview | `P-007` | permission-filtered launcher only |
| Posting resolve preview | feature-specific read-only diagnostic sub-surface | structured result inside Posting Profiles; no posting or CRUD ownership |

No child uses a Candidate pattern. Independent resources are not forced into
P-003 tabs merely because they share a route.

Web adds first-class Finance setup routes for Accounts and Accounting Setup.
COA uses `SplitTreeView` / `HierarchicalTreeList`; lists use `MyDataGrid`;
forms use `MyForm` and shared fields/dialogs/feedback. Search/filter/sort for
potentially large lists is server-owned.

For Web COA, the closest composition reference is the existing Cost Center tree:
reuse its `SplitTreeView` master/detail interaction shape (selection, search,
detail/empty-detail panels and contextual child/edit actions) without copying HR
fields, permissions, move rules or domain code.

Mobile uses `AppHierarchicalTree`, `AppListScreen`, `AppDataTable`,
`AppForm`, `AppPageHeader`, `AppStateView` and `ConfirmationDialog`.
Financial setup mutation is online-authoritative. Cached/offline financial writes
are not part of Slice 1.

Both clients require English/Arabic UI, RTL/LTR, permission/read-only behavior,
accessible validation and responsive/touch layouts from existing shared systems.
Separately, every named master carries `NameAr` and `NameEn` through persistence,
typed transport, create/edit, detail, list/card/search and valid local mock drafts.
Singleton/history/mapping records without authored names display localized owner
names and do not duplicate them.

## 8. Delivery phases and verification

Phase 00 freezes this contract and current evidence before coding. Phases 01–05
implement Domain/API, Web, Mobile, domain actions and integration/runtime. Each
phase updates these applied books and `required-files.json` with actual source
evidence.

Within Slice 1, local implementation/repair now proceeds through child packages
`1A`–`1H`; `1V` performs the required cross-package reconciliation. A child can be
locally complete while the umbrella remains Not Verified.

Phase 01 implements the Domain/API surface and the lifecycle matrix above.
Client implementation and final Phase 06 reconciliation remain separate evidence
gates. `20260922091842_InitialAccounting` was generated from the complete current
EF model and verified on an ephemeral clean SQL Server database. A hosted development
database carrying the superseded Accounting history must be reset before applying it.

Phase 06 must reconcile every Required target here against runtime and return
`Verified` or `Not Verified`. A feature regression or missing Required behavior
cannot be accepted as a release note.

Every human feature step must first complete a feature-specific instance of
`documentation/plans/business/accounting-core-gl/MANUAL_ACCEPTANCE_SCENARIO_TEMPLATE.md`.
The user runs or supervises its Web and actual-device Mobile cases and explicitly
accepts or rejects the result. No later step becomes Active, and no Phase 06 or
documentation closure is recorded, before that acceptance. The final `1V` package
repeats the protocol for the complete cross-child setup chain.

Typed Web and Mobile clients exist for Fiscal Years, Currency and COA; COA live
verification remains open. Other Ledger Setup routes currently use generic
compatibility screens and must not be described as completed typed children. The
Web parent layout registers Accounting
EN/AR resources for all Ledger Setup routes. Both clients page large setup
collections and fetch the full account detail before editing from the tree,
because tree nodes omit RowVersion. The API currently returns list arrays
without total counts and exposes server search only for Accounts and Dimension
Definitions; other paged views may search only their current page. This contract
gap must be resolved before describing collection-wide search as complete.

Only after `Verified` may Phase 07 create/finalize
`documentation/plans/business/accounting-core-gl/education/accounting-ledger-setup.md`.

## 9. Risks, drift, and migration safeguards

Current confirmed drift:

- Historical documents described Currency as HR-owned; current runtime and client
  ownership have already moved it to Accounting and must not regress.
- Accounting architecture previously attributed Branch ownership to Platform;
  runtime proves HR Organizational Structure owns Branch/CostCenter.
- several Link Account source masters named by the long-term business design do not
  exist yet.

Safeguards:

- one writable Currency master at every completed deployment state;
- the clean development baseline keeps one Accounting Currency identity; any future
  customer-data migration requires a separately rehearsed preservation plan;
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
