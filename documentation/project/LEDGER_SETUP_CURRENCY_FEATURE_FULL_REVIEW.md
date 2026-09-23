# Ledger Setup Currency — Cross-Platform Implementation Review

## 1. Purpose and decision

`ledger-setup-currency` is child `1A` of `accounting-core-gl` Slice 1. Accounting is
the single writable owner of the company Currency master. The current runtime was
created during the Currency ownership cutover and is evidence to reconcile, not an
automatic child-completion claim. The package follows the closed Screen/Workflow
Contract at `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-currency.md`.

## 2. Product boundary and operating model

Currency owns only company-scoped currency identity: three-letter normalized code,
English/Arabic names, symbol, audit state and optimistic-concurrency token. It owns
an active read-only catalog for cross-module consumers. Functional Currency belongs
to Company Settings; FX type/rate history belongs to Exchange Rates. HR owns only
its business-record CurrencyCode snapshots and validates user input through the
Accounting public Contract.

Operating mode is `existing-feature change / reconciliation`. No legacy facade,
parallel aggregate or data-preservation migration is authorized for the clean
development baseline.

## 3. Domain contract

- `Currency` is a `CompanyAuditableEntity` in Accounting.
- `CurrencyCode` is trimmed, uppercased and must contain exactly three ASCII letters.
- `NameEn` and `NameAr` are required and bounded to 100 characters; `Symbol` is
  required and bounded to 10.
- Currency does not own `IsDefault`, `ExchangeRateToDefault`, Functional Currency,
  exchange-rate history, approval state or financial amounts.
- Archive/restore are Application lifecycle operations over the auditable soft-delete
  state; hard delete is not part of this child.

## 4. API and persistence contract

The canonical API is `/api/v1/currencies`: page, active lookup, detail, create,
update, archive and restore. Writes derive tenant/company from `ICurrentActor` and
run through `IAccountingUnitOfWork`. `acc.Currencies` has company-scoped uniqueness
for CurrencyCode and RowVersion concurrency. Archive checks references from
Accounting Company Settings, Accounts and Exchange Rates. The public
`IAccountingCurrencyCatalog` exposes only active same-company currencies.

## 5. Authorization and ownership

`AccountingSetup:View` gates page/detail/lookup. `AccountingSetup:Manage` gates
create/update/archive/restore. `[TenantMember]` and Accounting scope filters remain
authoritative. Clients never submit trusted tenant/company identifiers. Cross-module
consumers use the Accounting Contract; they do not query `AccountingDbContext`.

## 6. Web implementation

The dedicated Next.js feature at `web-next/src/modules/accounting/currencies/`
owns transport types/service, query keys/hooks, structural validation, Grid, form and
page orchestration. It reuses `PageHeader`, `MyDataGrid`, `MyForm`, `MyTextField`,
`ConfirmationDialog`, `useServerListState` and `useAdaptivePagination`. The route is
`/finance/ledger-setup/currencies`. A 409 conflict invalidates/refetches authoritative
data before another write. No generic Ledger Setup record renderer is child authority.

## 7. Mobile implementation

The Expo feature at `mobile-react/src/modules/accounting/currencies/` keeps domain
models/policy/repository, application use cases, remote schemas/source, composition,
queries and presentation separate. `AppListScreen` presents Table/Cards over the
same server page; `AppForm` owns create/edit/view. Writes require RowVersion and a
live server. No feature-owned offline write or local Currency database is approved.

## 8. Lifecycle, integration, and UI audit

Create starts active. Update is allowed for active records. Archive is idempotent if
already archived and blocked when referenced. Restore is idempotent if already active.
Archived records remain discoverable through status filtering but are absent from
active lookup/catalog. Web/Mobile read-only modes hide/block mutation controls while
preserving view access. EN/AR and RTL use existing Accounting/mobile locale scopes.
Currency mutation success invalidates relevant client page/detail/lookup caches.

## 9. Verification evidence and known repository state

Phase 06 recorded `Verified` on 2026-09-22. Evidence includes 14 Currency behavior
tests, two ownership architecture tests, one clean-baseline migration test, 31 focused
HR consumer tests, 34 Web Currency/navigation/permission tests, 27 Mobile
Currency/route/permission tests, Web production build and API-backed Admin/Normal
User journeys in Arabic, English and compact layout. Web static/architecture gates
and Mobile typecheck/lint/architecture/i18n/native/foundation/release-source gates
passed.

The global Mobile Contract Matrix still reports sibling Ledger Setup paths and the
generic sibling transport owned by packages `1B`–`1H`; this is classified as an
inherited repository failure and is not a Currency regression. Physical hosted
device and phone/tablet accessibility evidence remains governed by central release
notes `PROD-010` and `PROD-014`.

## 10. Handoff and next slices

Currency child `1A` is closed after Phase 06 `Verified` and Phase 07 publication of
`documentation/plans/business/accounting-core-gl/education/ledger-setup-currency.md`.
Execution advances to `ledger-setup-coa-hierarchy`, followed by Dimensions,
Books/Journals, Company Settings, Exchange Rates, Link Accounts, Posting Profiles and
final Integration/Verification. Slice 1 remains open until package `1V` verifies the
integrated posting context.
